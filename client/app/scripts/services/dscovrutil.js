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
                // the day DSCOVR went operational! Party with cake at 9:45 AM.
		var mission_begin = moment("26-07-2016", "DD-MM-YYYY").startOf('day');
		var mission_end = moment().subtract(1, 'days').endOf('day');

		// Public API here
		return {
			dateInRange: function (check_date) {
				return check_date && moment(+check_date).isBetween(mission_begin, mission_end, null, "[]");
			},
			getMissionBegin: function() {
				return moment(mission_begin);
			},
			getMissionEnd: function() {
				return moment(mission_end);
			},
		};
	});
