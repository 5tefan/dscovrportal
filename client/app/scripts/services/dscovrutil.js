'use strict';

/**
 * @ngdoc service
 * @name dscovrDataApp.dscovrUtil
 * @description
 * # dscovrUtil
 * Factory in the dscovrDataApp.
 */
angular.module('dscovrDataApp')
	.factory('dscovrUtil', function () {
		// Service logic
		var mission_start = moment.utc("02-03-2015", "DD-MM-YYYY");
		var mission_end = moment.utc("12-12-2015", "DD-MM-YYYY");

		// Public API here
		return {
			dateInRange: function ( check_date ) {
				return check_date && moment.utc( +check_date ).isBetween( mission_start, mission_end );
			},
			getMissionStart: function() {
				return mission_start;
			},
		};
	});
