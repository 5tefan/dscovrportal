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

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
