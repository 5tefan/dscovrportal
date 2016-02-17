'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:VisScatterCtrl
 * @description
 * # VisScatterCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
	.controller('VisScatterCtrl', function ($scope, $timeout, $cookieStore,
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
		var evalSelections = function(cb) { //cb -> call back
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
			// takes f1m:proton_speed:linear;f1m:proton_density:linear
			// and puts proton_speed in x_accessor and proton_density
			// in y_accessor

			var _, selsplitlog, sel; //temp vars for parsing seleciton string
			_ = selection.split(";");
			var request_selection = [];

			selsplitlog = _[0].split("*");
			var sel = selsplitlog[0].split(':');
			var x_scale_type = (selsplitlog[1]=='log'?'log':'linear');
			var x_prod = sel[0];
			var x_accessor = sel[1];
			request_selection.push(selsplitlog[0]);

			selsplitlog = _[1].split("*");
			sel = selsplitlog[0].split(':');
			var y_scale_type = (selsplitlog[1]=='log'?'log':'linear');
			var y_prod = sel[0];
			var y_accessor = sel[1];
			request_selection.push(selsplitlog[0]);

			var x_label = x_accessor + ($scope.params[x_prod][x_accessor]?" ["+$scope.params[x_prod][x_accessor]+"]":"");
			var y_label = y_accessor + ($scope.params[y_prod][y_accessor]?" ["+$scope.params[y_prod][y_accessor]+"]":"");

			show_info("requesting data");
			dscovrDataAccess.getValues3(request_selection.join(";"), timerange, conditions).then( function( data ) {
				show_info("data received, parsing");
				var trace = {
					x: [], y: [],
					marker: { 
						color: [],
						autocolorscale: false,
						colorscale: true,
						colorbar: {
							title: "date",
							tickmode: "array",
							tickvals: [],
							ticktext: [],
						}
					 },
					mode: 'markers',
					type: 'scatter',
					hoverinfo: "x+y",
				};
				var interval = Math.floor(data.length / 3);
				data.map( function(dat, i){
						if (((i + Math.floor(interval/1.7)) % interval) == 0) {
							trace.marker.colorbar.tickvals.push(dat.time);
							trace.marker.colorbar.ticktext
							.push(moment(dat.time).format("YYYY-MM-DD HH:MM"));
						}
						if (dat[x_accessor] == "-9999" | dat[x_accessor] == "-999" 
						| dat[y_accessor] == "-9999" | dat[y_accessor] == "-999") {
							return
						};
						trace.marker.color.push(dat.time);
						trace.x.push( dat[x_accessor] );
						trace.y.push( dat[y_accessor] );
				});
				if (trace.x.length > 0) { //check that we have data worth plotting
					show_info("plot will appear below");
					$scope.plot = {
						traces: [trace],
						layout: {
							autosize: true,
							title: y_accessor+" vs "+x_accessor,
							hovermode:'closest',
							xaxis: { 
								title: x_label,
								type: x_scale_type,
								showline: true,
							 },
							yaxis: { 
								title: y_label,
								type: y_scale_type,
								showline: true,
							 },
						},
						makesquare: true,
						download_link: {
							timerange: timerange,
							params: (y_prod == x_prod)?x_prod:x_prod+";"+y_prod,
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
					$cookieStore.put("scatter.arg", $scope.selection_str);
					$cookieStore.put("scatter.argg", $scope.timerange.join(":"));
					$cookieStore.put("scatter.arggg", $scope.condition_str);
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
		}, show_error);

		if ($routeParams.arg) {
			$scope.predef_selec = $routeParams.arg;
		} else if ($cookieStore.get("scatter.arg")) {
			$scope.predef_selec = $cookieStore.get("scatter.arg");
		};

		if ($routeParams.argg) {
			$scope.predef_time = $routeParams.argg.split(':').map( Number );
		} else if ($cookieStore.get("scatter.argg")) {
			$scope.predef_time = $cookieStore.get("scatter.argg").split(':').map( Number );
		};

		if ($routeParams.arggg) {
			$scope.predef_cond = $routeParams.arggg;
		} else if ($cookieStore.get("scatter.arggg")) {
			$scope.predef_cond = $cookieStore.get("scatter.arggg");
		};

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
