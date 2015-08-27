'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:VisEventCtrl
 * @description
 * # VisEventCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
	.controller('VisEventCtrl', function ($scope, $timeout, dscovrDataAccess) {
		$scope.where = "";
		dscovrDataAccess.getParameters().then( function(data) {
			$scope.params = data;
		});

		//when we need to get the conditions from the condition container
		// will broadcast evalConditions and give a callback which utilizes
		// the generated condition string.
		$scope.evalConditions = function() {
			$scope.$broadcast("evalConditions", function(condition_str) {
				if (condition_str) {
					console.log(condition_str); //TODO replace with request
				} else {
					// flash an error message if none of the conditions are valid
					$scope.error = "please enter at least 1 valid condition!";
					$timeout(function() {
						$scope.error = "";
					}, 5000);
				}
			})
		};

	});
