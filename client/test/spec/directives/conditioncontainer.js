'use strict';

describe('Directive: conditionContainer', function () {

  // load the directive's module
  beforeEach(module('dscovrDataApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();
	element = $compile('<div condition-container></div>')(scope);
  }));

	it('should have 0 conditions to start', function() {
		expect(element.isolateScope().conditions.length).toBe(0);
	});

	it('should not remove anything if there are no conditions', function() {
		element.isolateScope().rmCondition(0);
		expect(element.isolateScope().conditions.length).toBe(0);
	});

	it('should add a condition', function() {
		element.isolateScope().addCondition();
		expect(element.isolateScope().conditions.length).toBe(1);
	});

	it('should add and remove a condition', function() {
		element.isolateScope().addCondition();
		expect(element.isolateScope().conditions.length).toBe(1);
		element.isolateScope().rmCondition(0);
		expect(element.isolateScope().conditions.length).toBe(0);
	});

});
