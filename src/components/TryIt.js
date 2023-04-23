import AceEditor from "react-ace";
import Alert from "react-bootstrap/Alert";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-searchbox";
import "ace-builds/src-noconflict/mode-gherkin";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";
import SimpleTerminal from "./SimpleTerminal";

import FeatureHolder from "./FeatureHolder";



class TryIt extends FeatureHolder {
    getSnippets(file) {
        this.setState({ ready: true })
        this.setState({ showSpinner: false })
    }

    clearOutput () {
        this.terminal.current.clearStdout()
    }

    render() {
        let saveButton;

        const fileOptionItems = this.getFilteredFiles().map(opt => (
            <option key={opt}>{opt}</option>
        ));
        if (this.state.draft) {
            saveButton = (
              <span><button
                className="btn btn-primary btn-sm"
                onClick={this.saveCode.bind(this)}
                style={{ backgroundColor: "lightcoral", marginTop: 5, marginBottom: 5 }}
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
                        <div className="col-9">
                            <Alert variant="primary" dismissible>
                                <Alert.Heading>How does it work?</Alert.Heading>
                                <hr />
                                <ul>
                                    <li>You can select files via the dropdown list and edit them directly in the editor.</li>
                                    <li>Click on `Save file` to save changes.</li>
                                    <li>Choose a feature and click on `Run feature` to execute it.</li>
                                </ul>
                            </Alert>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-1">
                            <label style={{ fontWeight: 500 }}>Select file:</label>
                        </div>
                        <div className="col-6">
                            <select id="fileselect"
                                style={{ margin: 5 }}
                                onChange={this.fileSelectionChanged.bind(this)}>
                                {fileOptionItems}
                            </select>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <AceEditor
                                ref={this.editor}
                                mode={this.state.code_mode}
                                theme="github"
                                name="codeDiv"
                                width="auto"
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
                                style={{ marginTop: 5, marginBottom: 5 }}
                            >
                                Run feature
                            </button>
                            <span>&nbsp;<button
                                className="btn btn-light btn-sm"
                                onClick={this.clearOutput.bind(this)}
                                style={{ marginTop: 5, 
                                         marginBottom: 5,
                                         backgroundColor: "#D3D3D3" }}
                            >
                                Clear output
                            </button></span>

                        </div>
                        <div className="row">
                            <div className="col-9">
                                <SimpleTerminal
                                    minHeight="150px"
                                    ref={this.terminal}></SimpleTerminal>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}

export default TryIt;