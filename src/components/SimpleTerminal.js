/* Copyright (c) 2021-present Tomra Systems ASA */
import React, { Component } from "react";

const LogLine = ({id, logText}) => {
    let txtcolor = "white"
    let margin = 5;
    const featureRegex = /Feature.*#\s/gm;
    const scenarioRegex = /Scenario.*#\s/gm;
    const stepRegex = /(Given|And\s|Or\s|When|Then).*#\s/gm;
    const summaryRegex = /\d{1,}\sfeature\s/gm;

    if (logText.match(featureRegex)) {
        logText = logText + "<br /><br />"
    } else if (logText.match(scenarioRegex)) {
        logText = "<span>&nbsp;&nbsp;</span>" + logText
    } else if (logText.match(stepRegex) !== null) {
        logText = "<span>&nbsp;&nbsp;&nbsp;&nbsp;</span>" + logText
    }else if (logText.match(summaryRegex) !== null) {
        logText = "<br />" + logText
    }
    let locationText = ""
    const logParts = logText.split("<span style=\"color:#555\">")
    if (logParts.length === 2) {
        logText = logParts[0]
        locationText = "<span style=\"color:#555\">" + logParts[1]
    }

    return <div key={id} style={{ marginLeft: margin, marginTop: 2, marginBottom: 0, color: txtcolor }}>
        <span dangerouslySetInnerHTML={{__html: logText}}></span>
        <span dangerouslySetInnerHTML={{__html: locationText}}></span>
    </div>;
}

const LogList = ({logLines}) => {
    const logEntries = logLines.map(logLine => {
        return <LogLine id={logLine.id} key={logLine.id} logText={logLine.text} />;
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
            minHeight: this.props.minHeight || "200px",
            borderRadius: "8px",
            fontSize: 10
        };
        return (<div style={consoleStyle}>
                <LogList logLines={this.state.data}></LogList>
        </div>);
    }
}

export default SimpleTerminal;
