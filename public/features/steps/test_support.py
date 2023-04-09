from behave import step


@step('I verify I get "{error_msg}" error when I run step')
def step_impl(context, error_msg):
    pass
