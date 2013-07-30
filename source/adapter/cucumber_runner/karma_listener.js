(function (global) {
  var KarmaListener = function KarmaListener(karma, karmaCucumberJsSettings) {
    var self = {
      currentStep: null,
      currentScenario: null,
      currentFeature: null,
      scenarioSuccess: true,
      scenarioSkipped: false,
      scenarioLog: [],
      totalSteps: 0,
      eventMap: null,
      settings: null,

      hear: function hear(event, callback) {
        if (!self.eventMap) {
          self.eventMap = {
            'BeforeFeature': self.beforeFeature,
            'BeforeScenario': self.beforeScenario,
            'BeforeStep': self.beforeStep,
            'StepResult': self.stepResult
          };
        }

        var eventName = event.getName();

        // Some event names are not handled, those throw
        try {
          self.eventMap[eventName](event);
        } catch (e) {}

        callback();
      },

      beforeFeature: function beforeFeature(event) {
        self.currentFeature = event.getPayloadItem('feature');
      },

      beforeScenario: function beforeScenario(event) {
        self.currentScenario = event.getPayloadItem('scenario');
        self.currentScenario._time = new Date().getTime();
      },

      beforeStep: function beforeStep(event) {
        self.currentStep = event.getPayloadItem('step');
      },

      stepResult: function stepResult(event) {
        self.totalSteps++;
        karma.info({total: self.totalSteps});

        var result = event.getPayloadItem('stepResult');
        var stepSuccessful = self.checkStepSuccess(result);
        var stepSkipped = self.checkStepSkipped(result);

        self.checkStepFailure(result);

        var currentScenarioName = self.currentScenario.getName();
        var currentFeatureName = self.currentFeature.getName();
        var timeElapsed = self.getScenarioTimeElapsed(stepSkipped);

        karma.result({
          description: currentScenarioName,
          log: self.scenarioLog,
          suite: [currentFeatureName],
          success: stepSuccessful,
          skipped: stepSkipped,
          time: timeElapsed
        });
      },

      checkStepSuccess: function checkStepSuccess(stepResult) {
        var result = (self.scenarioSuccess &&
          (stepResult.isSuccessful() ||
            (self.shouldAcceptPending() && stepResult.isPending())
          )
        );
          
        return result;
      },
              
      shouldAcceptPending: function shouldAcceptPending() {
        var result = !!(self.settings &&
          self.currentFeature &&
          self.currentFeature.getName &&
          self.settings[self.currentFeature.getName()] &&
          self.currentScenario &&
          self.currentScenario.getName &&
          self.settings[self.currentFeature.getName()][self.currentScenario.getName()] &&
          self.settings[self.currentFeature.getName()][self.currentScenario.getName()].indexOf("allowPending") >= 0
        );

        return result;
      },

      checkStepSkipped: function checkStepSkipped(stepResult) {
        return stepResult.isSkipped();
      },

      checkStepFailure: function checkStepFailure(stepResult) {
        if (!stepResult.isSuccessful() &&
          !stepResult.isPending() &&
          !stepResult.isUndefined() &&
          !stepResult.isSkipped()) {
          var error = stepResult.getFailureException();
          var currentStepName = self.currentStep.getName();

          var errorLog = "";
          if (error.stack) {
            errorLog = currentStepName + '\n' + error.stack;
          } else {
            errorLog = currentStepName + '\n' + error;
          }
          self.scenarioLog.push(errorLog);
        }
      },

      getScenarioTimeElapsed: function getScenarioTimeElapsed(scenarioSkippedStatus) {
        var timeElapsed;
        if (scenarioSkippedStatus) {
          timeElapsed = 0;
        } else {
          timeElapsed = new Date().getTime() - self.currentStep._time;
        }

        return timeElapsed;
      },

      toString: function toString() {
        return '[object KarmaListener]';
      }
    };
    
    self.settings = karmaCucumberJsSettings;

    return self;
  };

  define([], function () {
    return KarmaListener;
  });
}(window));