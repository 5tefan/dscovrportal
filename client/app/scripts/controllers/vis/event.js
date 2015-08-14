'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:VisEventCtrl
 * @description
 * # VisEventCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
	.controller('VisEventCtrl', function ($scope, $timeout) {
		$scope.param_test = { 	"m1m" : { "bz": "nt", "by": "nt"},
							"f1m" : { "pr": "pr", "et": "tc"}
					};
		$scope.where = "";

		// on eval clicked, broadcast this message, 
		// the condition-container will react by evaluating the conditions
		// and through the two way binding with $scope.where here, we will
		// have the result. NOTE: $broadcast is async so see the binding 
		// below for evalClickedCallback which condition container boradcasts
		// a trigger for when it is done evaluating.
		$scope.evalConditions = function() {
			$scope.$broadcast("evalConditions", function(where) {
				if (where) {
					console.log(where); //TODO replace with request
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
