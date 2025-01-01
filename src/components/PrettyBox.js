/* Copyright (c) 2021-present Tomra Systems ASA */
import React, { PureComponent } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/googlecode.css"
import python from "highlight.js/lib/languages/python";

class PrettyBox extends PureComponent {
    constructor(props) {
        super(props);
        this.codeBlock = React.createRef();

        //Stop warnings spamming console. 
        //See issue: https://github.com/highlightjs/highlight.js/issues/2886
        hljs.configure({ ignoreUnescapedHTML: true });

        hljs.registerLanguage("python", python);
    }

    componentDidMount() {
        // Stop log spamming about highlighting same element again.
        // See: https://github.com/highlightjs/highlight.js/issues/3761#issuecomment-2498745244
        document.querySelectorAll("pre code:not(.hljs)").forEach((block) => { hljs.highlightElement(block); });
    }

    render() {
        return (
            <div>
                <pre className="prettyprint">
                    <code className="python">
                        {this.props.fileName + "\n"}
                        {this.props.code}
                    </code>
                </pre>
            </div>
        );
    }
}

export default PrettyBox;
