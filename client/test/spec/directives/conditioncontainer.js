'use strict';

describe('Directive: conditionContainer', function () {

  // load the directive's module
  beforeEach(module('dscovrDataApp'));

  var element,
    scope,
	isolated;

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();
	element = $compile('<div condition-container></div>')(scope);
	scope.$digest();
	isolated = element.isolateScope();
  }));

	it('should have 0 conditions to start', function() {
		expect(isolated.conditions.length).toBe(0);
	});

	it('should not remove anything if there are no conditions', function() {
		isolated.rmCondition(0);
		expect(isolated.conditions.length).toBe(0);
	});

	it('should add a condition', function() {
		isolated.addCondition();
		expect(isolated.conditions.length).toBe(1);
	});

	it('should remove a condition', function() {
		isolated.rmCondition(0);
		expect(isolated.conditions.length).toBe(0);
	});

});
