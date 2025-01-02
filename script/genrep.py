"""
    Prototyping area for Python code run in Pyodide
"""
import ast
import json

def get_json_step_report():
    with open("script/reports/feature.json", "r", encoding="utf-8") as file:
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
    except:  # pylint: disable=W0702
        pass
    if node:
        for body in node.body:
            if isinstance(body, ast.FunctionDef):
                step_text = None
                try:
                    step_text = body.decorator_list[0].args[0].value
                except:  # pylint: disable=W0702
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
global snippet_json  # pylint: disable=W0604
snippet_json = json.dumps(code_snippets)
