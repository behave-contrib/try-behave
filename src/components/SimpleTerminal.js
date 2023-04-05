/* Copyright (c) 2021-present Tomra Systems ASA */
import React, { Component } from "react";

const LogLine = ({id, logText}) => {
    const gherkinElRegex = /(Feature|Scenario):.*#\s/gm;
    const stepRegex = /(Given|And\s|Or\s|When|Then).*#\s/gm;
    const skippedStepRegex = /#\sNone(\s*)$/gm;
    let txtcolor = "white"
    let margin = 5;
    if (logText.match(gherkinElRegex) !== null){
        txtcolor = "#91C6FE";
    }
    else if (logText.match(stepRegex) !== null) {
        margin = 50;
        if (logText.match(skippedStepRegex) !== null) {
            txtcolor = "yellow";
        } else {
            txtcolor = "cyan";
        }
    }
    return <p key={id} style={{ marginLeft: margin, marginTop: 2, marginBottom: 0, color: txtcolor }}>{logText}</p>;
}

const LogList = ({logLines}) => {
    const logEntries = logLines.map(logLine => {
        return <LogLine id={logLine.id} logText={logLine.text} />;
    });

    return logEntries;
};

class SimpleTerminal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
    }

    clearStdout() {
        this.setState({ data: [] });
    }

    pushToStdout(commandText) {
        const id = this.state.data.length + 1;
        this.state.data.push({ text: commandText, id: id });
        this.setState({ data: this.state.data });
    }

    render() {
        const consoleStyle = {
            backgroundColor: "black",
            color: "white",
            fontFamily: "monospace",
            overflow: "hidden",
            minHeight: "200px",
            minWidth: "100px",
            borderRadius: "8px",
            fontSize: 10
        };
        return (<div style={consoleStyle}>
                <LogList logLines={this.state.data}></LogList>
        </div>);
    }
}

export default SimpleTerminal;
