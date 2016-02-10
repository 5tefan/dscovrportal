'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:VisScatterCtrl
 * @description
 * # VisScatterCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
	.controller('VisScatterCtrl', function ($scope, $timeout, 
	dscovrDataAccess, $routeParams, $location, $rootScope) {

		//stats indicator for conditions met for plotting.
		// by default, assume no on page load, must check stuff
		$scope.can_plot = false;
		$scope.timerange_ready = false;

		$scope.$on('timerangeReady', function() {
			$scope.timerange_ready = true;
		});

		$scope.error = "";
		$scope.info = "";

		$scope.plot = {};

		var show_error = function(message) {
			$scope.error += message + "\n";
		};

		var show_info = function(message) {
			$scope.info += message + "\n";
		}

		// evaluate the selections from the main controller
		var evalSelections = function(cb) {
			show_info("evaluating request");
			// send a broadcast to get the date
			$scope.$broadcast('evalTimerange', function( timerange ) {
				console.log("got time range: " + timerange);
				$scope.timerange = timerange;
				// do some validation on it
				if (!$scope.timerange[0] || !$scope.timerange[1]) {
					// if either one is missing, error, can't plot, and return
					show_error("no time range selected");
					$scope.can_plot = false;
					return;
				} else if ($scope.timerange[0] >= $scope.timerange[1]) {
					// if begindat is after enddate, again, error, can't plot, return
					show_error("end date is not after start date");
					$scope.can_plot = false;
					return;
				};
				// enforce query limit of 1 month
				if (moment($scope.timerange[0]).add(1, 'months').isBefore($scope.timerange[1])) {
					show_error("queries larger than 1 month not supported");
					$scope.can_plot = false;
					return;
				};
				$scope.$broadcast('evalParameters', function(selection_str) {
					$scope.selection_str = selection_str;
					if ($scope.selection_str) {
						$scope.can_plot = true;

						$scope.$broadcast('evalConditions', function(condition_str) {
							$scope.condition_str = condition_str;
							if (cb) { cb() };
						});
					} else {
						show_error("Please select two variables to plot");
					};
				}); //end $scope.$broadcast('evalParameters'
			}); //end $scope.broadbast('evalTimerange'
		}; //end evalSelections fn

		var make_plot = function() {
			// creating copies of these variables so that if they are changed
			// after data is requested, we still know what we were doing.
			var selection = $scope.selection_str;
			var timerange = $scope.timerange.slice();
			var conditions = $scope.condition_str;
			show_info("requesting data");
			dscovrDataAccess.getValues3(selection, timerange, conditions).then( function( data ) {
				show_info("data received, parsing");
				
				// takes f1m:proton_speed:linear;f1m:proton_density:linear
				// and puts proton_speed in x_accessor and proton_density
				// in y_accessor

				var _, selsplitlog, sel; //temp vars for parsing seleciton string
				_ = selection.split(";");

				selsplitlog = _[0].split("*");
				sel = selsplitlog[0].split(':');
				var x_scale_type = (selsplitlog[1]=='log'?'log':'linear');
				var x_prod = sel[0];
				var x_accessor = sel[1];

				selsplitlog = _[1].split("*");
				sel = selsplitlog[0].split(':');
				var y_scale_type = (selsplitlog[1]=='log'?'log':'linear');
				var y_prod = sel[0];
				var y_accessor = sel[1];

				var x_label = x_accessor + " ["+$scope.params[x_prod][x_accessor]+"]";
				var y_label = y_accessor + " ["+$scope.params[y_prod][y_accessor]+"]";

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
						title: y_accessor + " vs " + x_accessor,
						y_accessor: y_accessor,
						x_accessor: x_accessor,
						y_scale_type: y_scale_type,
						x_scale_type: x_scale_type,
						y_label: y_label,
						x_label: x_label,
						download_link: {
							timerange: timerange,
							params: (y_accessor == x_accessor) ? x_accessor
								: x_accessor + ";" + y_accessor,
						},
					};
				} else { // if no data to show, display error
					show_error("no data matching request");
				};
			}, show_error); //end of dscovrDataAccess.getValues.then
		};

		$scope.go = function() {
			evalSelections( function() {
				var new_url = "/vis/scatter/" + $scope.selection_str + "/" 
				+ $scope.timerange.join(":") + "/" + $scope.condition_str;
				if ($location.url() != new_url) { // if location changed
					if ($scope.can_plot) {
						$location.url(new_url); // chnage route, this reloads the controller
					}
				} else {
					show_error("request unchanged and aready fulfilled");
				};
			});
		};

		dscovrDataAccess.getParameters2().then( function(data) {
			$rootScope.params = data;
		});


		if ($routeParams.arg) {
			$scope.predef_selec = $routeParams.arg;
		}

		if ($routeParams.argg) {
			$scope.predef_time = $routeParams.argg.split(':').map( Number );
		}

		if ($routeParams.arggg) {
			$scope.predef_cond = $routeParams.arggg;
		}

		if ($routeParams.arg && $routeParams.argg) { //must have both to plot
			var waiting_until_ready = function() {
				if ($scope.params && $scope.timerange_ready) {
					evalSelections(make_plot);
				} else { 
					$timeout( waiting_until_ready, 500 );
				}
			};
			waiting_until_ready();
		};
		
	});
