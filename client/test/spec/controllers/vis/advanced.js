'use strict';

describe('Controller: VisAdvancedCtrl', function () {

  // load the controller's module
  beforeEach(module('dscovrDataApp'));

  var VisAdvancedCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    VisAdvancedCtrl = $controller('VisAdvancedCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
