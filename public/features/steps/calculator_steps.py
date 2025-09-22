# © Copyright 2012-2020 by Jens Engel
# https://github.com/behave/behave.example
# License: BSD

# pylint: disable=E0102,E0611,E1102,C0103

from behave import given, register_type, then, when


def parse_number(text):
    """
    Convert parsed text into a number.
    :param text: Parsed text, called by :py:meth:`parse.Parser.parse()`.
    :return: Number instance (integer), created from parsed text.
    """
    return int(text)
# -- REGISTER: User-defined type converter (parse_type).
register_type(Number=parse_number)


@given('I have a calculator')
def step_impl(context):
    context.calculator = Calculator()

@when('I add "{x:Number}" and "{y:Number}"')
def step_impl(context, x, y):
    assert isinstance(x, int), f"Value x is not an int: {x}"
    assert isinstance(y, int), f"Value y is not an int: {x}"
    context.calculator.add2(x, y)
    print(f"Result: {context.calculator.result}")

@then('the calculator returns "{expected:Number}"')
def step_impl(context, expected):
    assert isinstance(expected, int), f"Expected value is not an int: {expected}"
    assert context.calculator.result == expected, f"Unexpected result: {context.calculator.result}"


# file:features/steps/calculator.py
# -----------------------------------------------------------------------------
# DOMAIN-MODEL:
# -----------------------------------------------------------------------------
class Calculator(object):

    def __init__(self, value=0):
        self.result = value

    def reset(self):
        self.result = 0

    def add2(self, x, y):
        self.result += (x + y)
        return self.result
