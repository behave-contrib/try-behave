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
                            <label style={{ fontWeight: 500 }}>File:</label>
                        </div>
                        <div className="col-6">
                            <select id="fileselect"
                                style={{ margin: 5 }}
                                onChange={this.fileSelectionChanged.bind(this)}>
                                {fileOptionItems}
                            </select>
                            <span>
                                <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" tabIndex="0" focusable="true" role="img" aria-label="Info">
                                    <title>Show Help.</title>
                                    <path fill="#007bff" d="M8 14A6 6 0 118 2a6 6 0 010 12zm0-1A5 5 0 108 3a5 5 0 000 10zm-.186-1.065A.785.785 0 017 11.12c0-.48.34-.82.814-.82.475 0 .809.34.809.82 0 .475-.334.815-.809.815zM5.9 6.317C5.96 5.168 6.755 4.4 8.048 4.4c1.218 0 2.091.759 2.091 1.8 0 .736-.36 1.304-1.03 1.707-.56.33-.717.56-.717 1.022v.305l-.1.1H7.47l-.1-.1v-.431c-.005-.646.302-1.104.987-1.514.527-.322.708-.59.708-1.047 0-.536-.416-.91-1.05-.91-.652 0-1.064.374-1.112.998l-.1.092H6l-.1-.105z"></path></svg>
                            </span>
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
                        {this.state.showSpinner && (
                                            <span
                                                style={{ marginRight: 5,
                                                    marginBottom: 5,
                                                    verticalAlign:"bottom" }}
                                                className="spinner-border text-primary"
                                                role="status"
                                            >
                                            </span>
                                        )}
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