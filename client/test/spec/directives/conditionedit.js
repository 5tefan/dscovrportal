'use strict';

describe('Directive: conditionEdit', function () {

  // load the directive's module
  beforeEach(module('dscovrDataApp'));

  var element,
    scope,
	isolated,
	q;

	beforeEach( function() {

		var mockDscovrDataAccess = {
			getParameters2: function() {
				var deferred = q.defer();
				deferred.resolve( mockDscovrDataAccessGetParameters2 );
				return deferred.promise;
			},
			getProducts2: function() {
				var deferred = q.defer();
				deferred.resolve( mockDscovrDataAccessGetProducts2 );
				return deferred.promise;
			},
		}

		module( function($provide) {
			$provide.value('dscovrDataAccess', mockDscovrDataAccess);
		});

		inject(function ($rootScope, $compile, dscovrDataAccess, $q) {
			q = $q;
			scope = $rootScope.$new();
			scope.condition = {};
			dscovrDataAccess.getParameters2().then( function(d) {
				scope.params = d
				element = $compile('<div condition-edit condition="condition"></div>')(scope);
				scope.$digest();
				isolated = element.isolateScope();
			});
		})

	});

	it('should define isolated.keys', function() {
		expect(isolated.keys).toBeDefined();
	});

	it('should define isolated.isConditionValid', function() {
		expect(isolated.isConditionValid).toBeDefined();
	});

	it('should set isolated.condition.construct', function() {
		isolated.prod = "m1m";
		isolated.param = "bt";
		isolated.relation = "gt";
		isolated.value = 5;
		isolated.$digest();
		expect(isolated.condition.construct).toBe("m1m:bt:gt:5");
	});

});
