'use strict';

describe('Directive: paramEdit', function () {

  // load the directive's module
  beforeEach(module('dscovrDataApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

	it('should define scope.keys', function() {
		expect(scope.keys).toBeDefined();
	});

	it('should define scope.prodTitle', function() {
		expect(scope.prodTitle).toBeDefined();
	});
});
