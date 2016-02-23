'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('dscovrDataApp'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('scrollTo should be defined', function () {
    expect(scope.scrollTo).toBeDefined();
  });
});
