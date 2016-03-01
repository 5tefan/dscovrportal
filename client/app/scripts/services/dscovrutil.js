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
		var mission_begin = moment.utc("02-03-2015", "DD-MM-YYYY");
		var mission_end = moment.utc().subtract(1, 'days').startOf('day');

		// Public API here
		return {
			dateInRange: function ( check_date ) {
				return check_date && moment.utc(+check_date).isBetween(mission_begin, mission_end);
			},
			getMissionBegin: function() {
				return moment.utc(mission_begin);
			},
			getMissionEnd: function() {
				return moment.utc(mission_end);
			},
		};
	});
