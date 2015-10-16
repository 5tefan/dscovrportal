'use strict';

describe('Directive: downloadTimeRange', function () {

  // load the directive's module
  beforeEach(module('dscovrDataApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<download-time-range></download-time-range>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the downloadTimeRange directive');
  }));
});
