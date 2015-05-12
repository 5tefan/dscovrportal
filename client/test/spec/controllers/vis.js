'use strict';

describe('Controller: VisCtrl', function () {

  // load the controller's module
  beforeEach(module('dscovrDataApp'));

  var VisCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    VisCtrl = $controller('VisCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
