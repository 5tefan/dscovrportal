'use strict';

describe('Directive: timeRange', function () {

  // load the directive's module
  beforeEach(module('dscovrDataApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();
	element = $compile('<div time-range predef="predef"></div>')(scope);
  }));

	it('should define onchange_begin', function() {
		expect(element.isolateScope().onchange_begin).toBeDefined();
	});

	it('should define onchange_end', function() {
		expect(element.isolateScope().onchange_end).toBeDefined();
	});

	it('should define evalTimerange', function() {
		expect(element.isolateScope().evalTimerange).toBeDefined();
	});

	it('should move end date if begin set after end', function() {
		//set the begin and end dates because if you do this test right away,
		// it cant actually move the end date because the end date is not 
		// within the time range
		element.isolateScope().selected_begin = moment().subtract(1, 'months').toDate();
		element.isolateScope().selected_end = moment().subtract(1, 'months').add(7, 'days').toDate();
		element.isolateScope().$apply();
		element.isolateScope().selected_begin = moment(element.isolateScope().selected_end).add(1, 'days');
		element.isolateScope().onchange_begin();
		expect(element.isolateScope().selected_end.valueOf())
			.toBeGreaterThan(element.isolateScope().selected_begin.valueOf());
	});

	it('should move begin date if end set before begin', function() {
		// on the other hand, this test should work because going back in time from the
		// mission end date should always be valid assuming the mission's lenght
		// is at least as long as 2 x default time range 
		element.isolateScope().selected_end = moment(element.isolateScope().selected_begin).subtract(1, 'days');
		element.isolateScope().onchange_end();
		expect(element.isolateScope().selected_end.valueOf())
			.toBeGreaterThan(element.isolateScope().selected_begin.valueOf());
	});

});
