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
		$scope.timerange_construct = "";
		dscovrDataAccess.getParameters().then( function(data) {
			$scope.params = data;
		});

		var make_plot = function() {
			var criteria = $scope.criteria;
			var time = $scope.timerange_construct;
			dscovrDataAccess.getValues("", criteria + time).then( function( data ) {
				$scope.plots = [];
				var plot = {
					data: data,
					title: criteria,
				}
				$scope.plots.push(plot);
			});
		};

		//when we need to get the conditions from the condition container
		// will broadcast evalConditions and give a callback which utilizes
		// the generated condition string.
		$scope.evalConditions = function() {
			$scope.$broadcast("evalConditions", function(condition_str) {
				if (condition_str) {
					$scope.criteria = condition_str;
					make_plot();
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
