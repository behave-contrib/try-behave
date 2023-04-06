
/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.0/full/pyodide.js");

async function loadPyodideAndPackages() {
    self.pyodide = await loadPyodide();
  await self.pyodide.loadPackage(["numpy", "pytz"]);
}
let pyodideReadyPromise = loadPyodideAndPackages();
let behaveReadyPromise = null;

runFeatures = (args) => {
    self.pyodide.runPython(`
    import sys
    import io
    sys.stdout = io.StringIO()
    from behave.__main__ import main as behave_main
    behave_main(${args})
    `);
    return self.pyodide.runPython("sys.stdout.getvalue()")
}

getFeatureJson = (feature) => {
    runFeatures(`["-i", "features/${feature}", "--f=json", "--dry-run", "--no-summary",
    "--no-snippets", "-o", "reports/feature.json"]`)
    self.pyodide.runPython(`import json
json_file = open("reports/feature.json")
with open("reports/feature.json", "r") as file:
    data = file.read()
print(data)
report = json.loads(data)
locations = []
for step in report[0]["elements"][0]["steps"]:
    locations.append(step["match"]["location"])
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
    for i in range(len(func_to_end) -1):
        if len(func_to_end[i].strip()) == 0:
            if i + 1 < len(func_to_end):
                if len(func_to_end[i].strip()) == 0:
                    break
        func_lines.append(func_to_end[i])
    snippets.append({"location": location, "file_lines": "".join(func_lines)})
    global snippet_json
    snippet_json = json.dumps(snippets)
`)
    return self.pyodide.globals.get("snippet_json");
}

self.onmessage = async (e) => {
    if(e.data.type === "doinit") {
        await pyodideReadyPromise;
        await self.pyodide.loadPackage("micropip");
        const micropip = self.pyodide.pyimport("micropip");
        await micropip.install(`${e.data.baseurl}/parse-1.19.0-py3-none-any.whl`);
        await micropip.install("behave");
        behaveReadyPromise = new Promise((resolve) => {
        // make sure loading is done
        self.pyodide.FS.mkdir("reports");
        self.pyodide.FS.mkdir("features");
        self.pyodide.FS.mkdir("features/steps");
        self.pyodide.runPython(`
        import base64
        encoded_steps = "ZnJvbSBiZWhhdmUgaW1wb3J0IHN0ZXAKZnJvbSB1cmxsaWIucmVxdWVzdCBpbXBvcnQgdXJsb3BlbgoKQHN0ZXAodSdJIGRvIG5vdCBkbyBtdWNoJykKZGVmIHN0ZXBfaW1wbChjb250ZXh0KToKICAgIHByaW50KCJOb3RoaW5nIG11Y2ggaGFwcGVuaW5nIGhlcmUiKQoKCkBzdGVwKHUnSSBkbyBhIGxvdCcpCmRlZiBzdGVwX2ltcGwoY29udGV4dCk6CiAgICBwcmludCgiVG9vIG11Y2ggaGFwcGVuaW5nIGhlcmUiKQoKCkBzdGVwKHUnSSByZWFkIHRoZSByZWFkbWUnKQpkZWYgc3RlcF9pbXBsKGNvbnRleHQpOgogICAgdXJsID0gImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9iZWhhdmUvYmVoYXZlL21hc3Rlci9SRUFETUUucnN0IgogICAgcmVhZG1lID0gdXJsb3Blbih1cmwpCiAgICBtc2cgPSAiIi5qb2luKG5leHQocmVhZG1lKS5kZWNvZGUoInV0Zi04IikgZm9yIF94IGluIHJhbmdlKDEwKSkKICAgIHByaW50KG1zZykK"
        with open("features/steps/documentation.py", "w") as fh:
            fh.write(base64.b64decode(encoded_steps).decode("utf-8"))
        `);
        self.pyodide.runPython(`
        with open("features/documentation.feature", "w") as fh:
            fh.write("""@example
                Feature: Documentation feature

                    As a tester, I read the documentation so that I can get things done

                    Scenario: Read Behave documentation
                        Given I do not do much
                        Then I do a lot
                """)
        `);
        resolve();
        postMessage({ type: "log", msg: "initialization done!" });
        postMessage({ type: "ready" });
        })
    }
    if (e.data.type === "run") {
        await behaveReadyPromise;
        const stdout = runFeatures(`["--no-capture", "-i", "features/documentation.feature"]`)
        postMessage({ type: "terminal", msg: stdout });

    }
    if (e.data.type === "snippets"){
        await behaveReadyPromise;
        const step_impls = getFeatureJson("documentation.feature")
        postMessage({ type: "snippet", msg: step_impls });
    }
};
