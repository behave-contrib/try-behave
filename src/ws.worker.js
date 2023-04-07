
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
    return self.pyodide.runPython("sys.stdout.getvalue()")
}

const getFeatureJson = (feature) => {
    runFeatures(`["-i", "features/${feature}", "--f=json", "--dry-run", "--no-summary",
    "--no-snippets", "-o", "reports/feature.json"]`)
    self.pyodide.runPython(`import json
def get_json_step_report():
    json_file = open("reports/feature.json")
    with open("reports/feature.json", "r") as file:
        data = file.read()
    return json.loads(data)

def get_step_locations():
    report = get_json_step_report()
    locations = []
    for step in report[0]["elements"][0]["steps"]:
        locations.append(step["match"]["location"])
    return locations

def is_empty_line(line):
    return len(line.strip()) == 0

def get_snippets():
    locations = get_step_locations()
    snippets = []
    for location in locations:
        parts = location.split(":")
        filename = parts[0]
        line_no = parts[1]
        file_lines = []
        with open(filename, "r") as source_file:
            file_lines = source_file.readlines()
        func_to_end = file_lines[int(line_no) -1:]
        func_lines = []
        for i in range(len(func_to_end)):
            if is_empty_line(func_to_end[i]):
                if i + 1 < len(func_to_end):
                    if is_empty_line(func_to_end[i + 1]):
                        break
            func_lines.append(func_to_end[i])
        snippets.append({"location": location, "file_lines": "".join(func_lines)})
    return snippets

snippets = get_snippets()
global snippet_json
snippet_json = json.dumps(snippets)
`)
    return self.pyodide.globals.get("snippet_json");
}

self.onmessage = async (e) => {
    if(e.data.type === "init") {
        await pyodideReadyPromise;
        await self.pyodide.loadPackage("micropip");
        const micropip = self.pyodide.pyimport("micropip");
        await micropip.install(`${e.data.baseurl}/trybehave/parse-1.19.0-py3-none-any.whl`);
        await micropip.install("behave");
        behaveReadyPromise = new Promise((resolve) => {
        // make sure loading is done
        self.pyodide.FS.mkdir("reports");
        self.pyodide.FS.mkdir("features");
        self.pyodide.FS.mkdir("features/steps");
        resolve();
        postMessage({ type: "log", msg: "initialization done!" });
        postMessage({ type: "init" });
        })
    }
    if (e.data.type === "file"){
        self.pyodide.runPython(`with open("${e.data.filename}", "w") as fh:
            fh.write("""${e.data.content}""")`)
        postMessage({ type: "ready" });
    }
    if (e.data.type === "run") {
        await behaveReadyPromise;
        const stdout = runFeatures(`["--no-capture", "-i", "${e.data.filename}"]`)
        postMessage({ type: "terminal", msg: stdout });

    }
    if (e.data.type === "snippets"){
        await behaveReadyPromise;
        const step_impls = getFeatureJson("documentation.feature")
        postMessage({ type: "snippet", msg: step_impls });
    }
};
