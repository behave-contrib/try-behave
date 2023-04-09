@example
Feature: Website login

    Scenario: Login user with password
        Given I connect to server
        When I login with user "phantom" and password "1234567890"
        Then I verify valid login for "Christopher Walker"
        And I close server connection


    Scenario: Login denied with wrong password
        Given I connect to server
        When I verify I get "Invalid Password" error when I run step:
           '''
            * I login with user "phantom" and password "123"
           '''
        Then I verify unauthorised access
        And I close server connection
