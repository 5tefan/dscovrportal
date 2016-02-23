'use strict';

describe('Controller: VisScatterCtrl', function () {

  // load the controller's module
  beforeEach(module('dscovrDataApp'));

  var VisScatterCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    VisScatterCtrl = $controller('VisScatterCtrl', {
      $scope: scope
    });
  }));

});
