'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
	.controller('MainCtrl', function ($scope, $location, $anchorScroll) {
		$scope.scrollTo = function(id) {
			$location.hash(id);
			$anchorScroll();
		}
	});

