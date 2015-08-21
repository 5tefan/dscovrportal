'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:VisScatterCtrl
 * @description
 * # VisScatterCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
	.controller('VisScatterCtrl', function ($scope, $timeout) {
		$scope.param_test = { 	"m1m" : { "bz": "nt", "by": "nt"},
							"f1m" : { "pr": "pr", "et": "tc"}
					};
		$scope.timerange_construct = "";

		$scope.evalSelections = function() {
			$scope.$broadcast('evalSelections', function(selection_str) {
				console.log("selstr" + selection_str);
				if (selection_str && selection_str.split(";").length == 2) {
					$scope.parameters = selection_str;
				}
					if ($scope.parameters) {
						console.log($scope.parameters);
					} else {
						// flash an error message if none of the panes are valid
						$scope.error = "request not valid";
						$timeout(function() {
							$scope.error = "";
						}, 5000);
					}
			});
		};
		
	});
