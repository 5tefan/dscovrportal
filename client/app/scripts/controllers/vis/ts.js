'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:VisTsCtrl
 * @description
 * # VisTsCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
	.controller('VisTsCtrl', function ($scope, $timeout, $cookieStore,
	dscovrDataAccess, $routeParams, $location, $rootScope) {

		$scope.can_plot = false;
		$scope.timerange_ready = false;

		$scope.$on('timerangeReady', function() {
			$scope.timerange_ready = true;
		});

		$scope.error = "";
		$scope.info = "";

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
				//initialize the string we will be building, will look like
				// m1m:bx_gse;m1m:by_gse;;f1m:alpha_density where ; separate
				// parameters in the same plot and ;; separate different panes
				$scope.pane_strs = "";
				//ask the tsPaneContainer to tell us how many panes are in it so we
				// know how many to expect and when we are done evaluating.
				$scope.$broadcast('evalNumPanes', function(num_panes) {
					console.log("evalPanes expecting # panes: " + num_panes);
					var num_pane_responses = 0;
					// as the tsPaneEdit directives to send back their strings, we
					// put them all together and figure out when we have gotten them all
					$scope.$broadcast('evalParameters', function(pane_str) {
						if (pane_str) { //if a response was received
							++num_pane_responses;
							$scope.pane_strs += ($scope.pane_strs?';;':'') + pane_str;
						}
						if (num_pane_responses == num_panes) { //if we now have all the responses
							console.log("evalPanes received all responses");
							//after all panes respond, we will make request here, otherwise 
							// alert that we didnt get what we needed
							if ($scope.pane_strs) {
								$scope.can_plot = true;

								$scope.$broadcast('evalConditions', function(condition_str) {
									$scope.condition_str = condition_str;
									//make_plot();
									if (cb) { cb() };
								});
							} else {
								// show an error message if none of the panes are valid
								show_error("please enter at least 1 valid pane");
							} //end if ($scope.selection_strs)
						}; //end if (num_pane_responses == num_panes)
					}); //end $scope.$broadcast('evalParameters'
				}); //end $scope.$broadcast('evalNumPanes',
			}); //end $scope.broadbast('evalTimerange'
		}; //end evalSelections fn

		var make_plot = function() {
			// clear/initialize the plots on the page
			$scope.plots = [];
			// These are copies of things to go into the request
			var lines;
			var timerange = $scope.timerange.slice();
			var conditions = $scope.condition_str;
			// selection_strs split ;; gives the panels, map over the panels with panel_index
			$scope.pane_strs.split(";;").map( function(panel, panel_index) { if (panel) {
				console.log("processing panel: " + (panel_index + 1) + " : " + panel);
				// split the panel request string into the two main components, which are
				// specification of lines to plot + $$ + config options

				// These are the plotting options that will beed to be filled out
				var y_scale_type = "linear"; //default type for y_scale_type, just in case !confi
				var y_label = []
				var y_accessor;

				var _ = panel.split("*");
				lines = _[0];
				if (!lines) { show_error("panel " + (panel_index + 1) + ": nothing to do"); return; }
				if (_[1]) {
					// split the config options, first part is conditions and second
					// part specifies log or linear y axis
					y_scale_type = (_[1] == "log")?"log":"linear";
				} //end if (_[1])
				// this section (make y_label) basically pulls out the bz_gse from "m1m:bx_gse" strings
				// and also gets the units out of the params and puts the string "bx_gse [nT]"
				// into y_label
				if (lines.charAt(lines.length-1) == ";") {lines = lines.slice(0, -1)}
				y_accessor = lines.split(";").map( function(line) {
					var _ = line.split(":")
					// create the label and add the units
					y_label.push( _[1] + ($scope.params[_[0]][_[1]]?" ["+$scope.params[_[0]][_[1]]+"]":"") );
					return _[1]
				}); 
				y_label.join(', ');
				// end (make y_lablel)

				show_info("panel " + (panel_index + 1) + ": requesting data");
				dscovrDataAccess.getValues3(lines, timerange, conditions).then( function(data) {
					show_info("panel " + (panel_index + 1) + ": data received, parsing");
					var traces = y_accessor.map( function(att) { 
						return {
							x: [], y: [],
							mode: 'markers',
							marker: {
								symbol: "circle",
								size: 3,
							},
							name: att,
							line: { width: 1 },
						};
					});
					var dates = [];
					var utcoffset = moment().utcOffset();
					data.map( function(dat) {
							dates.push( moment( dat.time ).subtract(utcoffset, 'minutes').toDate() );
							y_accessor.map( function(att, j) {
								if (dat[att] == -99999) {
									traces[j].y.push( null );
								} else {
									traces[j].y.push( +dat[att] );
								}
							});
					});
					traces.map( function(trace) { 
						trace.x = dates;
					});
					if (dates.length > 1) { // check that we have data worth plotting
						show_info("panel " + (panel_index + 1) + ": plot will appear below");
						var title = lines + " from " + timerange.map( Date ).join(" to ");
						// append to $scope.plots so that ng-repeat directive sees and plots
						$scope.plots[panel_index] =  {
							traces: traces,
							layout: {
								title: y_accessor.join(', ')+" vs time",
								xaxis: { 
									title: "utc time",
									showline: true,
								 },
								yaxis: { 
									title: y_label,
									type: y_scale_type,
									showline: true,
								},
								margin: {t: 80},
							},
						};
					} else { // if no data to show, display error
						show_error("Panel " + (panel_index + 1) + ": no data matching request");
					} // end if (d.length > 1)
				}, function(err_msg) { 
					// this second function is the error call for dscovrDataAccess.then,
					// wrapping in an anon fn to grab panel_index from this scope to append to err msg
					show_error("Panel " + (panel_index + 1) + ": " + err_msg) 
				}); // end dscovrDataAccess getValues lines
			} } ); //end selection_strs map panel if panel
		}

		// $scope.go is what to do when the plot button is pressed. High level, this constructs a request string,
		// compares it with the previous request, if it is different, proceedes, otherwise alerts user that the
		// request has already been fulfilled
		$scope.go = function() {
			evalSelections(function() {
				var new_url = "/vis/ts/" + $scope.pane_strs + "/" 
					+ $scope.timerange.join(":") + "/" +  $scope.condition_str;
				if ($location.url() != new_url) { // if location changed
					$cookieStore.put("vis.arg", $scope.pane_strs);
					$cookieStore.put("vis.argg", $scope.timerange.join(":"));
					$cookieStore.put("vis.arggg", $scope.condition_str);
					if ($scope.can_plot) {
						$location.url(new_url); // chnage route, this reloads the controller
					}
				} else {
					show_error("request unchanged and aready fulfilled");
				}
			});
		};

		dscovrDataAccess.getParameters2().then( function(data) {
			$rootScope.params = data;
		}, show_error);

		dscovrDataAccess.getProducts2().then( function(data) {
			$rootScope.prods = data;
		}, show_error);

		// $routeParams.arg holds info on panels, if exists, set predef_param
		if ($routeParams.arg) { // the lines
			$scope.predef_param = $routeParams.arg;
		} else if ($cookieStore.get("vis.arg")) {
			$scope.predef_param = $cookieStore.get("vis.arg");
		};
		if ($routeParams.argg) { // the time range
			$scope.predef_time = $routeParams.argg.split(":").map( Number );
		} else if ($cookieStore.get("vis.argg")) {
			$scope.predef_time = $cookieStore.get("vis.argg").split(":").map( Number );
		};
		if ($routeParams.arggg) { // conditions
			$scope.predef_cond = $routeParams.arggg;
		} else if ($cookieStore.get("vis.arggg")) {
			$scope.predef_cond = $cookieStore.get("vis.arggg");
		};
		// if $routeParams.arg and $routeParams.argg, try to plot
		if ($routeParams.arg && $routeParams.argg) {
			//this timeout is needed becuase otherwise
			//eval selections sends the broadcast before the
			//child directives are linked and so they don't hear.
			//This delays but TODO: make the deepest child emit
			// a message and catch it here that it is loaded.
			var waiting_until_ready = function() {
				if ($rootScope.params && $scope.timerange_ready) {
					evalSelections(make_plot);
				} else { 
					$timeout( waiting_until_ready, 500 );
				}
			};
			waiting_until_ready();
		};


	});
