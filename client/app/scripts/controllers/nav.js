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
  });
