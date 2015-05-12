'use strict';

describe('Controller: NavCtrlCtrl', function () {

  // load the controller's module
  beforeEach(module('dscovrDataApp'));

  var NavCtrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    NavCtrlCtrl = $controller('NavCtrlCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
