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

		$scope.error = "";
		$scope.info = "";
		$scope.plot = {};

		var show_error = function(message) {
			$scope.error += message + "\n";
		};

		var show_info = function(message) {
			$scope.info += message + "\n";
		}

		var evalSelections = function(cb) { //cb -> call back
			show_info("evaluating request");
			// first, do some date validation. Must parse it first
			var datesplit = $scope.timerange_construct.split(';');
			var begindate = Number(datesplit[0].split(':')[3]);
			var endindate = Number(datesplit[1].split(':')[3]);
			if (!begindate || !endindate) {
				// if either one is missing, error, can't plot, and return
				show_error("no time range selected");
				$scope.can_plot = false;
				return;
			} else if (begindate >= endindate) {
				// if begindat is after enddate, again, error, can't plot, return
				show_error("end date is not after start date");
				$scope.can_plot = false;
				return;
			};
			//eval from the sactterplotpane to get parameters to plot
			$scope.$broadcast('evalSelections', function(selection_str) {
				if (selection_str && selection_str.split(";").length == 2) {
					$scope.selection_str = selection_str;
					//eval from the condition pane
					$scope.$broadcast("evalConditions", function(condition_str) {
						$scope.condition_str = condition_str;
						$scope.can_plot = true;
						//make_plot();
						if (cb) { cb() };
					})
				} else {
					// show error message if none of the panes are valid
					show_error("please select parameters to plot");
				}
			});
		};

		var make_plot = function() {
			// creating copies of these variables so that if they are changed
			// after data is requested, we still know what we were doing.
			var selection = $scope.selection_str;
			var criteria = $scope.condition_str + $scope.timerange_construct;
			var datesplit = $scope.timerange_construct.split(';');
			var begindate = Number(datesplit[0].split(':')[3]);
			var endindate = Number(datesplit[1].split(':')[3]);
			show_info("requesting data");
			dscovrDataAccess.getValues2(selection, criteria).then( function( data ) {
				show_info("data received, parsing");
				
				// takes f1m:proton_speed:linear;f1m:proton_density:linear
				// and puts proton_speed in x_accessor and proton_density
				// in y_accessor
				var x_accessor = selection.split(";")[0].split(":");//[1]
				var y_accessor = selection.split(";")[1].split(":");//[1]

				var x_label = x_accessor[1] + " [" + $scope.params[x_accessor[0]][x_accessor[1]] + "]";
				var y_label = y_accessor[1] + " [" + $scope.params[y_accessor[0]][y_accessor[1]] + "]";

				// filter the data for fill values to convert to null
				// since this is not time series, each point is individual
				// so we dont have to worry about putting nulls in gaps to 
				// make sure that lines don't get drawn connecting them like
				// we do for ts, hence this loop is much simpler
				var i = 0; // loop iter counter
				var nulls = false;
				var process = function() {
					while (i < data.length) {
						//null fill values and decide if we have a 
						//sequence of nulls we can get rid of
						nulls = false;
						Object.keys(data[i]).map( function(k) {
							if (+data[i][k] == -9999 | +data[i][k] == -999) {
								nulls = true;
							};
						});
						// since these are x and y, if either is null, we cant plot so
						// splice dat
						if (nulls) {
							data.splice(i, 1); //we must splice
							// below, we setTimeout to occasionally give control
							// elsewhere so that UI remains responsive
							setTimeout(process, 1);
						} else {
							data[i].time = new Date(+data[i].time);
							i++;
						};
					} //end while
				}; //end process
				process();
				if (data.length > 0) { //check that we have data worth plotting
					show_info("plot will appear below");
					$scope.plot = {
						data: data,
						title: y_accessor[1] + " vs " + x_accessor[1],
						y_accessor: y_accessor[1],
						x_accessor: x_accessor[1],
						y_scale_type: $scope.adv.y_scale_type,
						x_scale_type: $scope.adv.x_scale_type,
						y_label: y_label,
						x_label: x_label,
						download_link: {
							beginms: begindate,
							endms: endindate,
							params: (y_accessor[0] == x_accessor[0]) ? x_accessor[0] 
								: x_accessor[0] + ";" + y_accessor[0],
						},
					};
				} else { // if no data to show, display error
					show_error("no data matching request");
				};
			}, show_error); //end of dscovrDataAccess.getValues.then
		};

		$scope.go = function() {
			evalSelections( function() {
				var new_url = "/vis/scatter/"
					+ $scope.selection_str.split(";")[0] + ":" + $scope.adv.x_scale_type + ";"
					+ $scope.selection_str.split(";")[1] + ":" + $scope.adv.y_scale_type  + "/"
					+ $scope.condition_str + $scope.timerange_construct;
				if ($location.url() != new_url) { // if location changed
					if ($scope.can_plot) {
						$location.url(new_url); // chnage route, this reloads the controller
					}
				} else {
					show_error("request unchanged and aready fulfilled");
				}
			});
		};

		$scope.timerange_construct = "";

		dscovrDataAccess.getParameters2().then( function(data) {
			$scope.params = data;
		}, show_error);

		// advanced options for log scales will fill here
		$scope.adv = { x_scale_type: "linear", y_scale_type: "linear" };

		//stats indicator for conditions met for plotting.
		// by default, assume no on page load, must check stuff
		$scope.can_plot = false;

		if ($routeParams.arg && $routeParams.argg) {
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
					if (str_cond[2] == "ge" || str_cond[2] == "gt") {
						$scope.predef_time[0] = str_cond[3];
					} else {
						$scope.predef_time[1] = str_cond[3];
					}
				} else {
					$scope.predef_cond.push( str_cond )
				}
			});

			function waiting_until_ready() {
				if ($scope.params) {
					//console.log("waiting_until_ready finished, calling eval");
					evalSelections(make_plot);
				} else { 
					//console.log("waiting_until_ready not finished");
					$timeout( waiting_until_ready, 500 );
				}
			};
			waiting_until_ready();
		}
		
	});
