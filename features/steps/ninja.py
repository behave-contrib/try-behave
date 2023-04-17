# © Copyright 2012-2020 by Jens Engel
# https://github.com/behave/behave.example
# License: BSD

# pylint: disable=E0401,E0602,E0611,C0114,C0116,E0102,W0613,W0614,W0401

from behave import *


@given('the ninja encounters another opponent')
def step_the_ninja_encounters_another_opponent(context):
    """
    BACKGROUND steps are called at begin of each scenario before other steps.
    """
    # -- SETUP/TEARDOWN:
    if hasattr(context, "ninja_fight"):
        # -- VERIFY: Double-call does not occur.
        assert context.ninja_fight is not None
    context.ninja_fight = None

@given('the ninja has a {achievement_level}')
def step_the_ninja_has_a(context, achievement_level):
    context.ninja_fight = NinjaFight(achievement_level)

@when('attacked by a {opponent_role}')
def step_attacked_by_a(context, opponent_role):
    context.ninja_fight.opponent = opponent_role

@when('attacked by {opponent}')
def step_attacked_by(context, opponent):
    context.ninja_fight.opponent = opponent

@then('the ninja should {reaction}')
def step_the_ninja_should(context, reaction):
    actual_reaction = context.ninja_fight.decision()
    print(f"Reaction: {actual_reaction}")
    assert reaction == actual_reaction


# file:features/steps/ninja_fight.py
# ----------------------------------------------------------------------------
# PROBLEM DOMAIN:
# ----------------------------------------------------------------------------
class NinjaFight(object):
    """
    Domain model for ninja fights.
    """

    def __init__(self, with_ninja_level=None):
        self.with_ninja_level = with_ninja_level
        self.opponent = None

    def decision(self):
        """
        Business logic how a Ninja should react to increase his survival rate.
        """
        assert self.with_ninja_level is not None
        assert self.opponent is not None
        if self.opponent == "Chuck Norris":
            return "run for his life"
        if "black-belt" in self.with_ninja_level:
            return "engage the opponent"
        else:
            return "run for his life"
