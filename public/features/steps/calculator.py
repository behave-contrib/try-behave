# © Copyright 2012-2020 by Jens Engel
# https://github.com/behave/behave.example
# License: BSD

# pylint: disable=E0401,E0602,E0611,C0103,C0114,C0115,C0116,E0102,W0613,W0614,W0401

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
