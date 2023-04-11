
/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.0/full/pyodide.js");

async function loadPyodideAndPackages() {
    self.pyodide = await loadPyodide();
  await self.pyodide.loadPackage(["numpy", "pytz"]);
}
let pyodideReadyPromise = loadPyodideAndPackages();
let behaveReadyPromise = null;

const runFeatures = (args) => {
    self.pyodide.runPython(`
    import sys
    import io
    sys.stdout = io.StringIO()
    from behave.__main__ import main as behave_main
    behave_main(${args})
    `);
    return self.pyodide.runPython("sys.stdout.getvalue()");
}

const getFeatureJson = (feature) => {
    runFeatures(`["-i", "${feature}", "--f=json", "--dry-run", "--no-summary",
    "--no-snippets", "-o", "reports/feature.json"]`);
    self.pyodide.runPython(`import json
import ast

def get_json_step_report():
    with open("reports/feature.json", "r") as file:
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
            if type(body) == ast.FunctionDef:
                step_text = None
                try:
                    step_text = body.decorator_list[0].args[0].value
                except Exception:
                    pass
                if step_text and step_text in step_decorator:
                    source_snippet = ""
                    for decorator in body.decorator_list:
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
        with open(filename, "r") as source_file:
            file_lines = source_file.readlines()
        step_decorator = file_lines[int(line_no) -1:int(line_no)][0]
        function_source = get_function_source(filename, step_decorator)
        existing_records = [rec for rec in snippets if rec["location"]==location and rec["file_lines"]==function_source]
        if len(existing_records) == 0:
            snippets.append({"location": location, "file_lines": function_source})
    return snippets

snippets = get_snippets()
global snippet_json
snippet_json = json.dumps(snippets)
`);
    return self.pyodide.globals.get("snippet_json");
}

self.onmessage = async (e) => {
    if(e.data.type === "init" & !self.initializing) {
        self.initializing = true;
        await pyodideReadyPromise;
        await self.pyodide.loadPackage("micropip");
        const micropip = self.pyodide.pyimport("micropip");
        await micropip.install(`${e.data.baseurl}/trybehave/parse-1.19.0-py3-none-any.whl`);
        await micropip.install("behave");
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
        //Se: https://pyodide.org/en/stable/usage/faq.html#why-can-t-i-import-a-file-i-just-wrote-to-the-file-system
        self.pyodide.runPython(`import importlib
with open("${e.data.filename}", "w") as fh:
    fh.write('''${e.data.content}''')
importlib.invalidate_caches()`);
        postMessage({ type: "ready" });
    }
    if (e.data.type === "run") {
        await behaveReadyPromise;
        const stdout = runFeatures(`["--no-capture", "-i", "${e.data.filename}"]`);
        postMessage({ type: "terminal", msg: stdout });

    }
    if (e.data.type === "snippets") {
        await behaveReadyPromise;
        const step_impls = getFeatureJson(e.data.filename);
        postMessage({ type: "snippet", msg: step_impls });
    }
};
