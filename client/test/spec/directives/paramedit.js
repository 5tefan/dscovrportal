'use strict';

describe('Directive: paramEdit', function () {

  // load the directive's module
  beforeEach(module('dscovrDataApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<param-edit></param-edit>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the paramEdit directive');
  }));
});
