# pylint: disable=E0401,E0602,E0611,C0103,C0114,C0116,E0102,W0212,W0613,W0614,W0401

def after_all(context):
    context._runner.step_registry.steps["given"] = []
    context._runner.step_registry.steps["when"] = []
    context._runner.step_registry.steps["then"] = []
    context._runner.step_registry.steps["steps"] = []
