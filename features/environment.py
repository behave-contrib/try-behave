# pylint: disable=W0212

def before_scenario(context, scenario):
    userdata = context.config.userdata
    if "continue_after_failed_step" in userdata:
        scenario.continue_after_failed_step = True

def after_all(context):
    context._runner.step_registry.steps["given"] = []
    context._runner.step_registry.steps["when"] = []
    context._runner.step_registry.steps["then"] = []
    context._runner.step_registry.steps["steps"] = []
