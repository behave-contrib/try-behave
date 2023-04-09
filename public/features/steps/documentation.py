# pylint: disable=E0611,C0114,C0116,E0102,W0611,W0613
from behave import given, step, then


@step('I do not do much')
def step_impl(context):
    print("Nothing much happening here")

@given('I do a lot')
@then('I do a lot')
def step_impl(context):
    print("Too much happening here")
