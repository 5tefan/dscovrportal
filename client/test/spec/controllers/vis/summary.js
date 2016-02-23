'use strict';

describe('Controller: VisSummaryCtrl', function () {

  // load the controller's module
  beforeEach(module('dscovrDataApp'));

  var VisSummaryCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    VisSummaryCtrl = $controller('VisSummaryCtrl', {
      $scope: scope
    });
  }));

});
