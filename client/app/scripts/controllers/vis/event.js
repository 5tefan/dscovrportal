'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:VisEventCtrl
 * @description
 * # VisEventCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
	.controller('VisEventCtrl', function ($scope, $timeout, dscovrDataAccess, $routeParams, $location) {

		$scope.can_plot = false;


		//when we need to get the conditions from the condition container
		// will broadcast evalConditions and give a callback which utilizes
		// the generated condition string.
		var evalConditions = function() {
			$scope.$broadcast("evalConditions", function(condition_str) {
				if (condition_str) {
					$scope.criteria = condition_str;
					$scope.can_plot = true;
				} else {
					// flash an error message if none of the conditions are valid
					$scope.can_plot = false;
					$scope.error = "please enter at least 1 valid condition!";
					$timeout(function() {
						$scope.error = "";
					}, 5000);
				}
			})
		};

		var make_plot = function() {
			evalConditions();
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

		$scope.go = function() {
			evalConditions();
			if ($scope.can_plot) {
				$location.url("/vis/event/" + $scope.criteria + $scope.timerange_construct);
			}
		};

		if ($routeParams.arg) {
			$scope.predef_cond = []
			$scope.predef_time = [0, 0]
			$routeParams.arg.split(";").map( function(str_cond) {
				str_cond = str_cond.split(":");
				if (str_cond[1] == "time") {
					if (str_cond[2] == "ge") {
						$scope.predef_time[0] = str_cond[3];
					} else {
						$scope.predef_time[1] = str_cond[3];
					}
				} else {
					$scope.predef_cond.push( str_cond )
				}
			});
			$timeout(make_plot, 1000);
		}

		$scope.timerange_construct = "";
		dscovrDataAccess.getParameters().then( function(data) {
			$scope.params = data;
		});



	});
