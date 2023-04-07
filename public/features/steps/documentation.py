from behave import step


@step('I do not do much')
def step_impl(context):
    print("Nothing much happening here")


@step('I do a lot')
def step_impl(context):
    print("Too much happening here")
