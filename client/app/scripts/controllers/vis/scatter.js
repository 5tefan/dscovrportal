'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:VisScatterCtrl
 * @description
 * # VisScatterCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
	.controller('VisScatterCtrl', function ($scope, $timeout, dscovrDataAccess) {
		$scope.timerange_construct = "";
		dscovrDataAccess.getParameters().then( function(data) {
			$scope.params = data;
		});

		var make_plot = function() {
			var selection = $scope.selection_str;
			var time = $scope.timerange_construct;
			var criteria = $scope.condition_str + time;
			dscovrDataAccess.getValues(selection, criteria).then( function( data ) {
				$scope.plots = [];
				var plot = {
					data: data,
					title: "hey",
					y_accessor: selection.split(";")[0].split(":")[1],
					x_accessor: selection.split(";")[1].split(":")[1],
				}
				console.log(data);
				$scope.plots.push(plot);
			});
		};

		$scope.evalSelections = function() {
			//eval from the sactterplotpane to get parameters to plot
			$scope.$broadcast('evalSelections', function(selection_str) {
				if (selection_str && selection_str.split(";").length == 2) {
					$scope.selection_str = selection_str;
					//eval from the condition pane
					$scope.$broadcast("evalConditions", function(condition_str) {
						if (condition_str) {
							$scope.condition_str = condition_str;
							make_plot();
						} else {
							// flash an error message if none of the conditions are valid
							$scope.error = "No valid conditions found!";
							$timeout(function() {
								$scope.error = "";
							}, 5000);
						}
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
		
	});
