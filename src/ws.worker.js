
/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.0/full/pyodide.js");

async function loadPyodideAndPackages() {
    self.pyodide = await loadPyodide();
  await self.pyodide.loadPackage(["numpy", "pytz"]);
}
let pyodideReadyPromise = loadPyodideAndPackages();
let behaveReadyPromise = null;

self.onmessage = async (e) => {
    if(e.data.type === "doinit") {
        await pyodideReadyPromise;
        await self.pyodide.loadPackage("micropip");
        const micropip = self.pyodide.pyimport("micropip");
        await micropip.install(`${e.data.baseurl}/parse-1.19.0-py3-none-any.whl`);
        await micropip.install("behave");
        behaveReadyPromise = new Promise((resolve) => {
        // make sure loading is done
        self.pyodide.FS.mkdir("features");
        self.pyodide.FS.mkdir("features/steps");
        self.pyodide.runPython(`
        import base64
        encoded_steps = "ZnJvbSBiZWhhdmUgaW1wb3J0IHN0ZXAKZnJvbSB1cmxsaWIucmVxdWVzdCBpbXBvcnQgdXJsb3BlbgoKQHN0ZXAodSdJIGRvIG5vdCBkbyBtdWNoJykKZGVmIHN0ZXBfaW1wbChjb250ZXh0KToKICAgIHByaW50KCJOb3RoaW5nIG11Y2ggaGFwcGVuaW5nIGhlcmUiKQoKCkBzdGVwKHUnSSBkbyBhIGxvdCcpCmRlZiBzdGVwX2ltcGwoY29udGV4dCk6CiAgICBwcmludCgiVG9vIG11Y2ggaGFwcGVuaW5nIGhlcmUiKQoKCkBzdGVwKHUnSSByZWFkIHRoZSByZWFkbWUnKQpkZWYgc3RlcF9pbXBsKGNvbnRleHQpOgogICAgdXJsID0gImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9iZWhhdmUvYmVoYXZlL21hc3Rlci9SRUFETUUucnN0IgogICAgcmVhZG1lID0gdXJsb3Blbih1cmwpCiAgICBtc2cgPSAiIi5qb2luKG5leHQocmVhZG1lKS5kZWNvZGUoInV0Zi04IikgZm9yIF94IGluIHJhbmdlKDEwKSkKICAgIHByaW50KG1zZykK"
        with open("features/steps/documentation.py", "w") as fh:
            fh.write(base64.b64decode(encoded_steps).decode("utf-8"))
        `);
        resolve();
        postMessage({ type: "log", msg: "initialization done!" });
        postMessage({ type: "ready" });

    })
    }
    if (e.data.type === "run") {
        await behaveReadyPromise;
        self.pyodide.runPython(`
        with open("features/documentation.feature", "w") as fh:
            fh.write("""@example
                Feature: Documentation feature

                    As a tester, I read the documentation so that I can get things done

                    Scenario: Read Behave documentation
                        Given I do not do much
                        # When I read the readme
                        Then I do a lot
                """)
        `);
        pyodide.runPython(`
        import sys
        import io
        sys.stdout = io.StringIO()
        from behave.__main__ import main as behave_main
        behave_main(["--no-capture", "--i", "features/documentation.feature"])
        `);
        let stdout = pyodide.runPython("sys.stdout.getvalue()")
        postMessage({ type: "terminal", msg: stdout });
    }
};
