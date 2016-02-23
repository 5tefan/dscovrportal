'use strict';

describe('Controller: VisTsCtrl', function () {

  // load the controller's module
  beforeEach(module('dscovrDataApp'));

  var VisTsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    VisTsCtrl = $controller('VisTsCtrl', {
      $scope: scope
    });
  }));

});
