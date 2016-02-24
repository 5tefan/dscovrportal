'use strict';

describe('Directive: downloadTimeRange', function () {

  // load the directive's module
  beforeEach(module('dscovrDataApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();
	element = $compile('<div download-time-range predef="predef"></div>')(scope);
  }));

	it('should define onchange_begin', function() {
		expect(element.isolateScope().onchange_begin).toBeDefined();
	});

	it('should define onchange_end', function() {
		expect(element.isolateScope().onchange_end).toBeDefined();
	});

	it('should define onchange_common', function() {
		expect(element.isolateScope().onchange_common).toBeDefined();
	});

	it('should move end date if begin set after end', function() {
		element.isolateScope().selected_begin = moment(element.isolateScope().selected_end)
			.add(1, 'days').toDate();
		element.isolateScope().onchange_begin();
		expect(element.isolateScope().selected_end.valueOf())
			.toBeGreaterThan(element.isolateScope().selected_begin.valueOf());
	});

	it('should move begin date if end set before begin', function() {
		element.isolateScope().selected_end = moment(element.isolateScope().selected_begin)
			.subtract(1, 'days').toDate();
		element.isolateScope().onchange_end();
		expect(element.isolateScope().selected_end.valueOf())
			.toBeGreaterThan(element.isolateScope().selected_begin.valueOf());
	});

});
