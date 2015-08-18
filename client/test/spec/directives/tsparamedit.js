'use strict';

describe('Directive: tsParamEdit', function () {

  // load the directive's module
  beforeEach(module('dscovrDataApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ts-param-edit></ts-param-edit>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the tsParamEdit directive');
  }));
});
