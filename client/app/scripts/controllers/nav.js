'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:NavCtrl
 * @description
 * # NavCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
	.controller('NavCtrl', function ($scope, $location, $rootScope, $http) {
		$scope.isActive = function(viewLocation) {
			return viewLocation === $location.path().split("/")[1];
		};
		// unfortunately gas is defined by https://github.com/digital-analytics-program/gov-wide-code
		// in the global namespace so we will just have to deal.
		if (typeof gas === 'function') {
			$rootScope.$on('$routeChangeSuccess', function() {
				gas('_', 'pageview', document.location.pathname + document.location.hash);
			});
		}
		
		$http.get("/dscovr/data/portal_notice.txt").then( function(response) {
			// success callback
			if (response.data) {
				$scope.alert = response.data;
			}
		}); // ignore errors, error callback is undefined
		

	});
