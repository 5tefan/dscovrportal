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

		var show_error = function(message) {
			$scope.error = message;
		};

		var show_alert = function(message) {
			$scope.warning = message;
		};

		var show_info = function(message) {
			$scope.info = message;
		}

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
			dscovrDataAccess.getValues2(selection, criteria).then( function( data ) {
				$scope.plots = [];
				var xsel = selection.split(";")[0].split(":")[1];
				var ysel = selection.split(";")[1].split(":")[1];

				// filter the data for nulls
				var i = 0;
				var bad = false;
				var process = function() {
					while (i < data.length) {
						//null fill values and decide if we have a 
						//sequence of nulls we can get rid of
						var nulls = 0;
						Object.keys(data[i]).map( function(k) {
							if (+data[i][k] == -9999 | +data[i][k] == -999) {
								nulls++;
							};
						});
						// we declare this time step bad if any of the data are null
						// and splice
						if (nulls) {
							data.splice(i, 1);
							setTimeout(process, 2);
						} else {
							data[i].time = new Date(+data[i].time);
							i++;
						}
					} //end while
				}; //end process
				process();
				if (data.length > 0) {
					var plot = {
						data: data,
						title: ysel + " vs " + xsel,
						y_accessor: ysel,
						x_accessor: xsel,
						y_scale_type: $scope.adv.y_scale_type,
						x_scale_type: $scope.adv.x_scale_type,
					}
					$scope.plots.push(plot);
				}
			}, show_error); //end of dscovrDataAccess.getValues.then
		};

		$scope.go = function() {
			evalSelections();
			if ($scope.can_plot) {
				var inj_scalet = 
					$scope.selection_str.split(";")[0] + ":" + $scope.adv.x_scale_type + ";"
					+ $scope.selection_str.split(";")[1] + ":" + $scope.adv.y_scale_type ;
				$location.url("/vis/scatter/" + inj_scalet
					+ "/" + $scope.condition_str + $scope.timerange_construct);
			}
		};


		$scope.timerange_construct = "";
		dscovrDataAccess.getParameters().then( function(data) {
			$scope.params = data;
		});

		// advanced options for log scales will fill here
		$scope.adv = { x_scale_type: "linear", y_scale_type: "linear" };

		//stats indicator for conditions met for plotting.
		// by default, assume no on page load, must check stuff
		$scope.can_plot = false;

		if ($routeParams.arg && $routeParams.argg) {
			$scope.predef_param = [];
			$scope.predef_cond = [];
			$scope.predef_time = [];
			$scope.predef_param = [];
			var temp_predef_param = $routeParams.arg.split(";"); //split the first arg into x and y specs
			if ( Object.prototype.toString.call( temp_predef_param ) === '[object Array]' //ensure arr results
			&& temp_predef_param.length == 2 ) { 		//len 2 arr specificallly, err alert on all else
				var _ = temp_predef_param[0].split(":"); 						//work on x first
				$scope.adv.x_scale_type = (_[2] == "log") ? "log" : "linear";	//grab the scale type
				$scope.predef_param.push( _[0] + ":" + _[1] );					//add x w/o scale type
				_ = temp_predef_param[1].split(":"); 						//now work on the y component
				$scope.adv.y_scale_type = (_[2] == "log") ? "log" : "linear";	//grab the scale type
				$scope.predef_param.push( _[0] + ":" + _[1] );					//add y w/o scale type
			} else {
				//error arg not formatted correctly
			}
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
		
	});
