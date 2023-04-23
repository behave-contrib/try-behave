/* Copyright (c) 2021-present Tomra Systems ASA */
import React, { Component } from "react";

const LogLine = ({id, logText}) => {
    let txtcolor = "white"
    let margin = 5;
    return <div key={id} style={{ marginLeft: margin, marginTop: 2, marginBottom: 0, color: txtcolor }}>
        <div dangerouslySetInnerHTML={{__html: logText}}></div>
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
