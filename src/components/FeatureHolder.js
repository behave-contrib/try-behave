/* eslint-disable import/no-webpack-loader-syntax */
import React, { Component } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-gherkin";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-searchbox";
import "ace-builds/src-noconflict/ext-language_tools";
import workerUrl from "worker-plugin/loader!../ws.worker.js";
import SimpleTerminal from "./SimpleTerminal";


class FeatureHolder extends Component {
    constructor() {
        // Pass props to parent class
        super();
        // Set initial state
        this.state = {
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
    }

    componentDidMount() {
        this.worker = new Worker(workerUrl);
        this.worker.postMessage({ type: "doinit" });
        this.worker.onmessage = (e) => {
            if (e.data.type === "log"){
                console.log(e.data.msg)
            }
            if (e.data.type === "ready"){
                this.worker.postMessage({ type: "run", msg: "runit" });
            }
            if (e.data.type === "terminal"){
                const lines = e.data.msg.split("\n");
                for (const line of lines) {
                    this.terminal.current.pushToStdout(line)
                }
                console.log(e.data.msg)
            }
        }
    }

    render() {
        return (
            <div>
                <div id="codeDiv" style={{ display: "none" }}>
                {this.state.code}
                </div>
                <div className="container-fluid" style={{margin: 5}}>
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
                            <SimpleTerminal ref={this.terminal}></SimpleTerminal>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default FeatureHolder;
