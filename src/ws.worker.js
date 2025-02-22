import config from "./config/config.json"
import Convert from "ansi-to-html"
import { Subject } from "rxjs"
import { buffer, filter, share } from "rxjs/operators";

/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.0/full/pyodide.js");

async function loadPyodideAndPackages() {
    self.pyodide = await loadPyodide({ stdout: (stdout) => postMessage({ type: "terminal", msg: stdout }) });
}

let pyodideReadyPromise = loadPyodideAndPackages();
let behaveReadyPromise = null;
let loadedFiles = []

const runFeatures = (args) => {
    console.log("Called runFeatures()")
    self.pyodide.runPython(`
    from behave.__main__ import main as behave_main
    behave_main(${args})
    del behave_main
    `, {});
}

const getFeatureJson = (feature) => {
    console.log("Feature path: " + feature)
    runFeatures(`["-i", "${feature}", "-f=json", "-o=reports/feature.json", "--no-summary", "--no-snippets", "-D", "continue_after_failed_step"]`);
    self.pyodide.runPython(`
    import ast
    import json

    def get_json_step_report():
        with open("reports/feature.json", "r", encoding="utf-8") as file:
            data = file.read()
        return json.loads(data)

    def get_step_locations():
        report = get_json_step_report()
        locations = []
        if len(report) > 0:
            for element in report[0]["elements"]:
                for step in element["steps"]:
                    if "match" in step:
                        locations.append(step["match"]["location"])
        return locations

    def get_function_source(filename, step_decorator):
        with open(filename, encoding="utf-8") as file:
            file_contents = file.read()
        node = None
        try:
            node = ast.parse(file_contents, "file", "exec")
        except:
            pass
        if node:
            for body in node.body:
                if isinstance(body, ast.FunctionDef):
                    step_text = None
                    try:
                        step_text = body.decorator_list[0].args[0].value
                    except:
                        pass
                    if step_text and step_text in step_decorator:
                        source_snippet = ""
                        for decorator in body.decorator_list:
                            source_snippet += "@"
                            source_snippet += ast.get_source_segment(file_contents, decorator)
                            source_snippet += "\\n"
                        source_snippet += ast.get_source_segment(file_contents, body)
                        return source_snippet

    def get_snippets():
        locations = get_step_locations()
        snippets = []
        for location in locations:
            parts = location.split(":")
            filename = parts[0]
            line_no = parts[1]
            with open(filename, "r", encoding="utf-8") as source_file:
                file_lines = source_file.readlines()
            step_decorator = file_lines[int(line_no) -1:int(line_no)][0]
            function_source = get_function_source(filename, step_decorator)
            existing_records = [rec for rec in snippets if rec["location"]==location and rec["file_lines"]==function_source]
            if len(existing_records) == 0:
                snippets.append({"location": location, "file_lines": function_source})
        return snippets

    code_snippets = get_snippets()
    global snippet_json
    snippet_json = json.dumps(code_snippets)
    `, {});
    const snippet_json = self.pyodide.globals.get("snippet_json");
    return snippet_json;
}

self.onmessage = async (e) => {
    if(e.data.type === "init" & !self.initializing) {
        self.initializing = true;
        await pyodideReadyPromise;
        await self.pyodide.loadPackage("micropip");
        const micropip = self.pyodide.pyimport("micropip");
        await micropip.install(`${e.data.baseurl}/try-behave/parse-1.19.0-py3-none-any.whl`);
        await micropip.install("behave");
        console.log("behave installed")
        // make sure loading is done
        behaveReadyPromise = new Promise((resolve) => {
            self.pyodide.FS.mkdir("reports");
            self.pyodide.FS.mkdir("features");
            self.pyodide.FS.mkdir("features/steps");
            postMessage({ type: "log", msg: "initialization done!" });
            postMessage({ type: "init" });
            resolve();
        });
    }
    if (e.data.type === "file") {
        self.pyodide.FS.writeFile(e.data.filename, e.data.content);
        loadedFiles.push(e.data.filename)
        if(loadedFiles.length === config.fileOptions.length){
            postMessage({ type: "ready" });
        }
    }
    if (e.data.type === "update_file") {
        self.pyodide.FS.writeFile(e.data.filename, e.data.content);
        postMessage({ type: "ready" });
    }
    if (e.data.type === "run") {
        await behaveReadyPromise;
        const input$ = new Subject();
        const convert = new Convert();
        const lineFeed = 10;
        const pipe = input$.pipe(
          share({
            connector: () => new Subject(),
            resetOnError: false,
            resetOnComplete: false,
            resetOnRefCountZero: false,
          }),
          filter(v => v !== lineFeed),
          buffer(input$.pipe(filter(v => v === lineFeed))),
        );
        pipe.subscribe(bytes => {
            if (bytes.length > 0) {
                let feature_output = new TextDecoder().decode(new Uint8Array(bytes));
                feature_output += "\n";
                const html_feature_output = convert.toHtml(feature_output);
                postMessage({ type: "terminal", msg: html_feature_output });
            }
          });
        const options = {isatty: true, raw: (b) => {input$.next(b)}}
        self.pyodide.setStdout(options)
        self.pyodide.runPython(`
        from importlib.machinery import SourceFileLoader
        SourceFileLoader("simple_pretty_formatter", "/home/pyodide/features/steps/simple_pretty_formatter.py").load_module()
        `);
        runFeatures(`["-i", "${e.data.filename}", "--no-capture", "-T", "-f=simple_pretty_formatter:SimplePrettyFormatter"]`);
    }
    if (e.data.type === "snippets") {
        await behaveReadyPromise;
        const step_impls = getFeatureJson(e.data.filename);
        postMessage({ type: "snippet", msg: step_impls });
    }
};
