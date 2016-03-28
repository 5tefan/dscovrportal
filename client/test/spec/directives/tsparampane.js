'use strict';

describe('Directive: tsParamPane', function () {

  // load the directive's module
  beforeEach(module('dscovrDataApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();
	element = $compile('<div ts-param-pane pane="pane"></div>')(scope);
	scope.$root.params = mockDscovrDataAccessGetParameters2;
  }));

	it('should have 1 param selection to start', function() {
		expect(element.isolateScope().selections.length).toBe(1);
	});

	it('should default to linear scale', function() {
		expect(element.isolateScope().adv.log).toBe(false);
	});

	it('should not remove the last param selection', function() {
		element.isolateScope().rmSelection(0);
		expect(element.isolateScope().selections.length).toBe(1);
	});

	it('should add a param selection', function() {
		element.isolateScope().addSelection();
		expect(element.isolateScope().selections.length).toBe(2);
	});

	it('should add and remove a param selection', function() {
		element.isolateScope().addSelection();
		expect(element.isolateScope().selections.length).toBe(2);
		element.isolateScope().rmSelection(0);
		expect(element.isolateScope().selections.length).toBe(1);
	});

	it('should evaluate empty string if no parameters are selected', function() {
		expect(element.isolateScope().evalParameters()).toBe("");
	});

	it('should create a string if only log selected', function() {
		element.isolateScope().adv.log = true;
		expect(element.isolateScope().evalParameters()).toBe("*log");
	});

	it('should create a string given predefs', function() {
		scope.pane = { predef: "m1m:bt;m1m:bx_gse" };
		element.isolateScope().$apply();
		expect(element.isolateScope().selections.length).toBe(2);
		expect(element.isolateScope().evalParameters()).toBe("m1m:bt;m1m:bx_gse");
	});

	it('should create a string given predefs and append log', function() {
		scope.pane = { predef: "m1m:bt;m1m:bx_gse" };
		element.isolateScope().$apply();
		element.isolateScope().adv.log = true;
		expect(element.isolateScope().selections.length).toBe(2);
		expect(element.isolateScope().evalParameters()).toBe("m1m:bt;m1m:bx_gse*log");
	});

	it('should parse the log from a predef', function() {
		scope.pane = { predef: "m1m:bt*log" };
		element.isolateScope().$apply();
		expect(element.isolateScope().adv.log).toBe(true);
	});
});
