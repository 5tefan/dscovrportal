'use strict';

describe('Directive: conditionEdit', function () {

  // load the directive's module
  beforeEach(module('dscovrDataApp'));

  var element,
    scope;

	beforeEach( function() {

		inject(function ($rootScope, $compile) {
			scope = $rootScope.$new();
			scope.condition = {};
			element = $compile('<div condition-edit condition="condition"></div>')(scope);
			scope.$root.params = mockDscovrDataAccessGetParameters2;
		})

	});

	it('should define keys', function() {
		expect(element.isolateScope().keys).toBeDefined();
	});

	it('should define isConditionValid', function() {
		expect(element.isolateScope().isConditionValid).toBeDefined();
	});

	it('should set condition.construct', function() {
		element.isolateScope().prod = "m1m";
		element.isolateScope().param = "bt";
		element.isolateScope().relation = "gt";
		element.isolateScope().value = 5;
		element.isolateScope().$apply();
		expect(element.scope().condition.construct).toBe("m1m:bt:gt:5");
	});

	it('should reject invalid condition product', function() {
		element.isolateScope().prod = "zzz";
		element.isolateScope().param = "bt";
		element.isolateScope().relation = "gt";
		element.isolateScope().value = 5;
		element.isolateScope().$apply();
		expect(element.scope().condition.construct).toBe("");
	});

	it('should reject invalid condition parameter', function() {
		element.isolateScope().prod = "m1m";
		element.isolateScope().param = "foobar";
		element.isolateScope().relation = "gt";
		element.isolateScope().value = 5;
		element.isolateScope().$apply();
		expect(element.scope().condition.construct).toBe("");
	});

	it('should reject invalid condition relation', function() {
		element.isolateScope().prod = "m1m";
		element.isolateScope().param = "bt";
		element.isolateScope().relation = "asdf";
		element.isolateScope().value = 5;
		element.isolateScope().$apply();
		expect(element.scope().condition.construct).toBe("");
	});

	it('should make a construct from a predefined external conidition', function() {
		scope.condition.predef = "m1m:bt:gt:5";
		element.isolateScope().$apply();
		expect(element.scope().condition.construct).toBe("m1m:bt:gt:5");
	});

	it('should initialize empty construct, parse predef, and change a value', function() {
		expect(element.scope().condition.construct).toBe(undefined);
		element.isolateScope().condition.predef = "m1m:bt:gt:5";
		element.isolateScope().$apply();
		expect(element.scope().condition.construct).toBe("m1m:bt:gt:5");
		element.isolateScope().value = 6;
		element.isolateScope().$apply();
		expect(element.scope().condition.construct).toBe("m1m:bt:gt:6");
	});

});
