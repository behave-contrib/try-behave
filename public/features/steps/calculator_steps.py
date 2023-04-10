# © Copyright 2012-2020 by Jens Engel
# https://github.com/behave/behave.example
# License: BSD

# pylint: disable=E0401,E0602,E0611,C0103,C0114,C0116,E0102,W0613,W0614,W0401

from behave import given, register_type, then, when
from calculator import Calculator


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
    assert isinstance(x, int)
    assert isinstance(y, int)
    context.calculator.add2(x, y)
    print(f"Result: {context.calculator.result}")

@then('the calculator returns "{expected:Number}"')
def step_impl(context, expected):
    assert isinstance(expected, int)
    assert context.calculator.result == expected
