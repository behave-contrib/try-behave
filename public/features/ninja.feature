# © Copyright 2012-2020 by Jens Engel
# https://github.com/behave/behave.example
# License: BSD

Feature: Fight or flight
  In order to increase the ninja survival rate,
  As a ninja commander
  I want my ninjas to decide whether to take on an
  opponent based on their skill levels

    Background: Ninja fight setup
        Given the ninja encounters another opponent

    Scenario: Weaker opponent
        Given the ninja has a third level black-belt
        When attacked by a samurai
        Then the ninja should engage the opponent

    Scenario: Stronger opponent
        Given the ninja has a second level black-belt
        When attacked by Chuck Norris
        Then the ninja should run for his life
