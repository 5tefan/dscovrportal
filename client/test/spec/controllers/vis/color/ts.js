'use strict';

describe('Controller: VisColorTsCtrl', function () {

  // load the controller's module
  beforeEach(module('dscovrDataApp'));

  var VisColorTsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    VisColorTsCtrl = $controller('VisColorTsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(VisColorTsCtrl.awesomeThings.length).toBe(3);
  });
});
