'use strict';

describe('Directive: autoScroll', function () {

  // load the directive's module
  beforeEach(module('dscovrDataApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<auto-scroll></auto-scroll>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the autoScroll directive');
  }));
});
