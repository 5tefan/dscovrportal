'use strict';

describe('Directive: paramEdit', function () {

  // load the directive's module
  beforeEach(module('dscovrDataApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();
	scope.selection = {};
	element = $compile('<div param-edit selection="selection"></div>')(scope);
	scope.$root.params = mockDscovrDataAccessGetParameters2;
  }));

	it('should define keys', function() {
		expect(element.isolateScope().keys).toBeDefined();
	});

	it('should define prodTitle', function() {
		expect(element.isolateScope().prodTitle).toBeDefined();
	});

	it('should create a construct on change of selection', function() {
		element.isolateScope().prod = "m1m";
		element.isolateScope().param = "bt";
		element.isolateScope().$apply();
		expect(element.scope().selection.construct).toBe("m1m:bt");
	});

	it('should make a construct from a predefined external selection', function() {
		scope.selection.predef = "m1m:bt";
		element.isolateScope().$apply();
		expect(element.scope().selection.construct).toBe("m1m:bt");
	});

});
