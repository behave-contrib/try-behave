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
        this.state = {
            read: false,
            code: `@example
Feature: Documentation feature

As a tester, I read the documentation so that I can get things done

Scenario: Read Behave documentation
    Given I do not do much
    Then I do a lot
`
        }
        this.editor = React.createRef();
        this.terminal = React.createRef();
        this.tabs = React.createRef();
    }

    componentDidMount() {
        this.worker = new Worker(workerUrl);
        this.terminal.current.clearStdout();
        this.worker.postMessage({ type: "doinit", baseurl: window.location.origin });
        this.worker.onmessage = (e) => {
            if (e.data.type === "log") {
                console.log(e.data.msg)
            }
            if (e.data.type === "ready") {
                this.setState({ready: true})
            }
            if (e.data.type === "terminal") {
                const lines = e.data.msg.split("\n");
                for (const line of lines) {
                    this.terminal.current.pushToStdout(line)
                }
            }
        }
    }

    runFeature() {
        this.terminal.current.clearStdout()
        this.worker.postMessage({ type: "run", msg: "runit" });
    }

    render() {
        return (
            <div>
                <div id="codeDiv" style={{ display: "none" }}>
                    {this.state.code}
                </div>
                <div className="container-fluid" style={{ margin: 5 }}>
                    <div className="row">
                        <div className="col-8">
                            <AceEditor
                                ref={this.editor}
                                mode="gherkin"
                                theme="github"
                                name="codeDiv"
                                width="1200px"
                                maxLines={Infinity}
                                //onChange={this.onChange.bind(this)}
                                value={this.state.code}
                                editorProps={{ $blockScrolling: Infinity }}
                                setOptions={{
                                    enableBasicAutocompletion: true
                                }}
                            />
                        </div>
                        <div>
                        <button
                            className="btn btn-primary btn-sm"
                            disabled={!this.state.ready}
                            onClick={this.runFeature.bind(this)}
                            >
                            Run feature
                            </button>
                        </div>
                        <div>
                            <Tabs forceRenderTabPanel={true} ref={this.tabs}>
                                <TabList>
                                    <Tab>Test step impl.</Tab>
                                    <Tab>Console log</Tab>
                                </TabList>
                                <TabPanel>
                                    <PrettyBox
                                        code={"@step('I do stuff')\ndef do_stuff(context):\n\tpass"}
                                        fileName={"# blabla/bla.py"}
                                        key={1}
                                    />
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
