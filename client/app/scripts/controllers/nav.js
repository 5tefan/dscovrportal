'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:NavCtrl
 * @description
 * # NavCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
	.controller('NavCtrl', function ($scope, $location) {
		$scope.isActive = function(viewLocation) {
			return viewLocation === $location.path().split("/")[1];
		};
		// unfortunately gas is defined by https://github.com/digital-analytics-program/gov-wide-code
		// in the global namespace so we will just have to deal.
		if (typeof gas === 'function') {
			$rootScope.$on('$routeChangeSuccess', function(event) {
				gas('_', 'pageview', $location.url());
			});
		};
	});
