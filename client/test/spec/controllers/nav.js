'use strict';

describe('Controller: NavCtrl', function () {

  // load the controller's module
  beforeEach(module('dscovrDataApp'));

  var NavCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    NavCtrl = $controller('NavCtrl', {
      $scope: scope
    });
  }));

  it('isActive should be defined', function () {
    expect(scope.isActive).toBeDefined();
  });
});
