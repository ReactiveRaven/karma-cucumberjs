Feature: A feature file for testing the Karma Cucumber adapter
  A test feature file to run the Karma Cucumber adapter

  Scenario: The green box is clicked on turning it red
    Given the box in the page is green
    When the user clicks on the box
    Then the box turns red

  Scenario: A scenario with pending steps allowed
    #karma-cucumberjs allowPending
    Given a step is pending
