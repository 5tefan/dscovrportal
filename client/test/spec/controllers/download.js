'use strict';

describe('Controller: DownloadCtrl', function () {

  // load the controller's module
  beforeEach(module('dscovrDataApp'));

  var DownloadCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DownloadCtrl = $controller('DownloadCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
