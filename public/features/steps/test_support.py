# pylint: disable=E0401,E0611,C0114,C0116,E0102,W0613
from behave import step


@step('I verify I get "{error_msg}" error when I run step')
def step_impl(context, error_msg):
    pass
