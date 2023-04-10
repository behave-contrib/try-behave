# pylint: disable=E0401,E0611,C0114,C0116,E0102,W0613
from behave import step


@step('I connect to server')
def step_impl(context):
    pass


@step('I login with user "{username}" and password "{password}"')
def step_impl(context, username, password):
    pass


@step('I verify valid login for "{name}"')
def step_impl(context, name):
    pass


@step('I close server connection')
def step_impl(context):
    pass


@step('I verify unauthorised access')
def step_impl(context):
    pass
