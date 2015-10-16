'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:VisScatterCtrl
 * @description
 * # VisScatterCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
	.controller('VisScatterCtrl', function ($scope, $timeout, dscovrDataAccess, $routeParams, $location) {

		$scope.can_plot = false;

		var evalSelections = function() {
			//eval from the sactterplotpane to get parameters to plot
			$scope.$broadcast('evalSelections', function(selection_str) {
				if (selection_str && selection_str.split(";").length == 2) {
					$scope.selection_str = selection_str;
					//eval from the condition pane
					$scope.$broadcast("evalConditions", function(condition_str) {
						if (condition_str) {
							$scope.condition_str = condition_str;
						} else {
							// flash an error message if none of the conditions are valid
							$scope.condition_str = "";
							$scope.error = "Using no conditions";
							$timeout(function() {
								$scope.error = "";
							}, 5000);
						}
						$scope.can_plot = true;
						//make_plot();
					})
				} else {
					// flash an error message if none of the panes are valid
					$scope.error = "please select some parameters to plot";
					$timeout(function() {
						$scope.error = "";
					}, 5000);
				}
			});
		};

		var make_plot = function() {
			evalSelections();
			var selection = $scope.selection_str;
			var time = $scope.timerange_construct;
			var criteria = $scope.condition_str + time;
			dscovrDataAccess.getValues(selection, criteria).then( function( data ) {
				$scope.plots = [];
				var xsel = selection.split(";")[0].split(":")[1];
				var ysel = selection.split(";")[1].split(":")[1];

				// filter the data for nulls
				var i = 0;
				var bad = false;
				while (i < data.length) {
					//null fill values and decide if we have a 
					//sequence of nulls we can get rid of
					var nulls = 0;
					Object.keys(data[i]).map( function(k) {
						if (+data[i][k] == -9999 | +data[i][k] == -999) {
							nulls++;
							data[i][k] = null;
						};
					});
					// we declare this time step bad if all the data
					// values are null
					if (nulls) {
						data.splice(i, 1);
					} else {
						data[i].time = new Date(+data[i].time);
						i++;
					}
				}
				var plot = {
					data: data,
					title: ysel + " vs " + xsel,
					y_accessor: ysel,
					x_accessor: xsel,
				}
				console.log(data);
				$scope.plots.push(plot);
			});
		};

		$scope.go = function() {
			evalSelections();
			if ($scope.can_plot) {
				$location.url("/vis/scatter/" + $scope.selection_str 
					+ "/" + $scope.condition_str + $scope.timerange_construct);
			}
		};


		if ($routeParams.arg && $routeParams.argg) {
			$scope.predef_param = [];
			$scope.predef_cond = [];
			$scope.predef_time = [];
			$scope.predef_param = $routeParams.arg.split(";");
			$routeParams.argg.split(";").map( function(str_cond) {
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
			console.log($scope.predef_cond);
			$timeout(make_plot, 1000);
		}

		$scope.timerange_construct = "";
		dscovrDataAccess.getParameters().then( function(data) {
			$scope.params = data;
		});

		
	});
