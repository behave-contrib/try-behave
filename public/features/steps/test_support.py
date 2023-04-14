# pylint: disable=E0401,E0611,C0114,C0116,E0102,W0613
from behave import step
from behave.runner import Context


@step('I verify I get "{error_msg}" error when I run step')
def step_impl(context: Context, error_msg):
    actual_error_msg = ""
    try:
        context.execute_steps(context.text)
    except Exception as ex:
        actual_error_msg = repr(ex)
    assert error_msg in actual_error_msg
