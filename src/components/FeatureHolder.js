/* Copyright (c) 2021-present Tomra Systems ASA */
/* eslint-disable import/no-webpack-loader-syntax */
import React, { Component } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-searchbox";
import "ace-builds/src-noconflict/mode-gherkin";
import "ace-builds/src-noconflict/theme-github";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import workerUrl from "worker-plugin/loader!../ws.worker.js";
import PrettyBox from "./PrettyBox";
import SimpleTerminal from "./SimpleTerminal";

class FeatureHolder extends Component {
    constructor() {
        // Pass props to parent class
        super();
        // Set initial state
        this.fileOptions = ["features/documentation.feature",
                            "features/steps/documentation.py"]
        this.modifiedFiles = []
        this.state = {
            initializing: false,
            selectedFile: this.fileOptions[0],
            ready: false,
            selectedTab: 0,
            snippets: [],
            code: "",
            draft: false
        }
        this.editor = React.createRef();
        this.terminal = React.createRef();
        this.worker = null;
    }

    loadFile(file=null) {
        if(!file){
            file = this.state.selectedFile;
        }
        const modifiedFile = this.findModifiedFile(file);
        if (modifiedFile) {
            console.log(`Loaded file with existing changes ${file}`);
            this.setState({code: modifiedFile.content});
        } else {
            fetch(`${window.location.origin}/trybehave/${file}`)
            .then(resp => {
                resp.text().then(text => {
                    console.log(`Loaded ${file}`);
                    this.setState({code: text});
                })
            });
        }
    }

    createFiles(worker) {
        let fileCount = 0
        this.fileOptions.forEach(file => {
            fetch(`${window.location.origin}/trybehave/${file}`)
            .then(resp => {
                resp.text().then(text => {
                    console.log(`Retrieved ${file}`);
                    worker.postMessage({ type: "file", filename: file, content: text })
                    fileCount++;
                    if(fileCount === this.fileOptions.length){
                        this.worker.postMessage({ type: "snippets" })
                    }
                })
            });
        });
    }

    init() {
        this.worker = new Worker(workerUrl);
        this.terminal.current.clearStdout();
        this.worker.postMessage({ type: "init", baseurl: window.location.origin });
        this.worker.onmessage = (e) => {
            if (e.data.type === "log") {
                console.log(e.data.msg)
            }
            if (e.data.type === "init") {
                this.createFiles(this.worker);
            }
            if (e.data.type === "terminal") {
                const lines = e.data.msg.split("\n");
                for (const line of lines) {
                    this.terminal.current.pushToStdout(line)
                }
            }
            if (e.data.type === "snippet") {
                const snippets = JSON.parse(e.data.msg);
                this.setState({ snippets: snippets })
                this.setState({ ready: true })
            }
            if (e.data.type === "ready"){
                this.setState({ draft: false });
                this.worker.postMessage({ type: "snippets" })
            }
        }
        this.loadFile();
    }

    componentDidMount() {
        if(!this.state.initializing) {
            this.setState({initializing: true})
            this.init();
        }
    }

    runFeature() {
        this.terminal.current.clearStdout()
        this.setState({ selectedTab: 1 })
        this.worker.postMessage({ type: "run", filename: this.state.selectedFile });
    }

    setTabIndex(tabIndex) {
        this.setState({ selectedTab: tabIndex })
    }

    fileSelectionChanged(event) {
        const file = event.target.value;
        this.setState({selectedFile: file})
        this.loadFile(file)
    }

    findModifiedFile(filename) {
        const matching =  this.modifiedFiles.filter(modfied => {
            return modfied.filename === filename
          });
          if (matching.length > 0){
            return matching[0]
          }
          return null;
    }

    onFileChange(content) {
        this.setState({ draft: true, code: content });
    }

    saveCode(){
        const existingModifiedFile = this.findModifiedFile(this.state.selectedFile);
        if (existingModifiedFile) {
            existingModifiedFile.content = this.state.code;
        } else {
            this.modifiedFiles.push({filename: this.state.selectedFile, content: this.state.code});
        }
        this.worker.postMessage({ type: "file", filename: this.state.selectedFile, content: this.state.code })
    }

    render() {
        let saveButton;
        const Snippets = () => {
            let count = -1;
            return this.state.snippets.map(snippet => {
                return <PrettyBox
                    code={snippet.file_lines}
                    fileName={`# ${snippet.location}`}
                    key={++count}
                />
            })
        }

        const fileOptionItems = this.fileOptions.map(opt => (
            <option key={opt}>{opt}</option>
        ));
        if (this.state.draft) {
            saveButton = (
              <span><button
                className="btn btn-primary btn-sm"
                onClick={this.saveCode.bind(this)}
                style={{ backgroundColor: "lightcoral" }}
              >
                Save file
              </button>&nbsp;</span>
              );
          }
        return (
            <div>
                <div id="codeDiv" style={{ display: "none" }}>
                    {this.state.code}
                </div>
                <div className="container-fluid" style={{ margin: 5 }}>
                    <div className="row">
                        <div className="col-1">
                            <label style={{ fontWeight: 600 }}>Select file:</label>
                        </div>
                        <div className="col-4">
                            <select id="filfilter"
                                style={{ marginBottom: 5 }}
                                onChange={this.fileSelectionChanged.bind(this)}>
                                {fileOptionItems}
                            </select>
                        </div>
                        <div className="col-8">
                            <AceEditor
                                ref={this.editor}
                                mode="gherkin"
                                theme="github"
                                name="codeDiv"
                                width="1200px"
                                maxLines={Infinity}
                                onChange={this.onFileChange.bind(this)}
                                value={this.state.code}
                                editorProps={{ $blockScrolling: Infinity }}
                                setOptions={{
                                    enableBasicAutocompletion: true
                                }}
                            />
                        </div>
                        <div>
                            {saveButton}
                            <button
                                className="btn btn-primary btn-sm"
                                disabled={!this.state.ready || 
                                    !this.state.selectedFile.endsWith(".feature")}
                                onClick={this.runFeature.bind(this)}
                            >
                                Run feature
                            </button>
                        </div>
                        <div>
                            <Tabs forceRenderTabPanel={true}
                                selectedIndex={this.state.selectedTab}
                                onSelect={this.setTabIndex.bind(this)}>
                                <TabList>
                                    <Tab>Test step impl.</Tab>
                                    <Tab>Console log</Tab>
                                </TabList>
                                <TabPanel>
                                    <Snippets />
                                </TabPanel>
                                <TabPanel>
                                    <SimpleTerminal ref={this.terminal}></SimpleTerminal>
                                </TabPanel>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default FeatureHolder;
