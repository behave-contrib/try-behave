@security
Feature: Website operations

    As a website adminstrator, I want my site to be secure,
    so that it does not expose data to those not authorised
    to view it.

    Scenario: Login user with password
        Given I connect to server
        And I create a user named "Christopher Walker" with username "phantom" and password "1234567890"
        When I login with user "phantom" and password "1234567890"
        Then I verify valid login for "phantom"
        And I close server connection

    Scenario: Login denied with wrong password
        Given I connect to server
        When I create a user with username "phantom" and password "1234567890"
        Then I verify I get "Invalid Password" error when I run step:
        """
         * I login with user "phantom" and password "123"
        """
        And I close server connection

    Scenario: View all users operation denied when insufficient privileges
        Given I connect to server
        And I create a user with username "phantom" and password "1234567890"
        When I login with user "phantom" and password "1234567890"
        Then I verify I get "Not authorised" error when I run step:
        """
         * I perform server operation "get_all_users"
        """
        And I close server connection
