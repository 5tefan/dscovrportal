'use strict';

describe('Directive: tsParamContainer', function () {

  // load the directive's module
  beforeEach(module('dscovrDataApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();
	element = $compile('<div ts-param-container predef="predef"></div')(scope);
  }));

	it('should have 1 panel to start', function() {
		expect(element.isolateScope().panes.length).toBe(1);
	});

	it('should not remove the only panel', function() {
		element.isolateScope().rmPane(0);
		expect(element.isolateScope().panes.length).toBe(1);
	});

	it('should add a panel', function() {
		element.isolateScope().addPane();
		expect(element.isolateScope().panes.length).toBe(2);
	});

	it('should add and remove a panel', function() {
		element.isolateScope().addPane();
		expect(element.isolateScope().panes.length).toBe(2);
		element.isolateScope().rmPane(1);
		expect(element.isolateScope().panes.length).toBe(1);
	});

	it('should create panels for predefined panels', function() {
		scope.predef = "m1m:bt;;m1m:bx_gse;m1m:by_gse;;m1m:bz_gse";
		element.isolateScope().$apply();
		expect(element.isolateScope().panes.length).toBe(3);
	});

});
