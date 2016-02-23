'use strict';

describe('Directive: tsParamContainer', function () {

  // load the directive's module
  beforeEach(module('dscovrDataApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

	it('should have 1 panel to start', function() {
		expect(scope.panes.length).toBe(1);
	});

	it('should not remove the only panel', function() {
		scope.rmPane(0);
		expect(scope.panes.length).toBe(1);
	});

	it('should add a panel', function() {
		scope.addPane();
		expect(scope.panes.length).toBe(2);
	});

	it('should remove a panel', function() {
		scope.rmPane(1);
		expect(scope.panes.length).toBe(1);
	});
/*
  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ts-param-container></ts-param-container>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the tsParamContainer directive');
  }));
*/
});
