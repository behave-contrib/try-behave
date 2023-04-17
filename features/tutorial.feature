# Copyright (c) 2012-2014 Benno Rice, Richard Jones, Jens Engel and others, except where noted.
# All rights reserved.
# https://github.com/behave/behave
# BSD-2-Clause

Feature: showing off behave

  Scenario: run a simple test
     Given we have behave installed
      When we implement a test
      Then behave will test it for us!
