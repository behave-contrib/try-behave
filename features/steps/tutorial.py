# Copyright (c) 2012-2014 Benno Rice, Richard Jones, Jens Engel and others, except where noted.
# All rights reserved.
# https://github.com/behave/behave
# BSD-2-Clause

# pylint: disable=E0401,E0602,E0611,C0114,C0116,E0102,W0613,W0614,W0401
from behave import *


@given('we have behave installed')
def step_impl(context):
    pass

@when('we implement a test')
def step_impl(context):
    assert True is not False

@then('behave will test it for us!')
def step_impl(context):
    assert context.failed is False
