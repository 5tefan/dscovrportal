'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:VisTsCtrl
 * @description
 * # VisTsCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
	.controller('VisTsCtrl', function ($scope, $timeout, dscovrDataAccess, $routeParams, $location) {

		$scope.can_plot = false;
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
			// enforce query limit of 1 month
			if (moment(begindate).add(1, 'months').isBefore(endindate)) {
				show_error("queries larger than 1 month not supported");
				$scope.can_plot = false;
				return;
			};
			//initialize the string we will be building, will look like
			// m1m:bx_gse;m1m:by_gse;;f1m:alpha_density where ; separate
			// parameters in the same plot and ;; separate different panes
			//  note: for formatting for the dscovr-data-access api do .split(";;").join(";")
			$scope.selection_strs = "";
			//ask the tsPaneContainer to tell us how many panes are in it so we
			// know how many to expect and when we are done evaluating.
			$scope.$broadcast('evalPanes', function(num_panes) {
				console.log("evalPanes expecting # panes: " + num_panes);
				var num_pane_responses = 0;
				// as the tsPaneEdit directives to send back their strings, we
				// put them all together and figure out when we have gotten them all
				$scope.$broadcast('evalSelections', function(selection_str) {
					if (selection_str) { //if a response was received
						++num_pane_responses;
						$scope.selection_strs += ($scope.selection_strs ? ';;' : '') + selection_str;
					}
					if (num_pane_responses == num_panes) { //if we now have all the responses
						console.log("evalPanes received all responses");
						//after all panes respond, we will make request here, otherwise 
						// alert that we didnt get what we needed
						if ($scope.selection_strs) {
							$scope.can_plot = true;
							//make_plot();
							if (cb) { cb() };
						} else {
							// show an error message if none of the panes are valid
							show_error("please enter at least 1 valid pane");
						} //end if ($scope.selection_strs)
					}; //end if (num_pane_responses == num_panes)
				}); //end $scope.$broadcast('evalSelections'
			}); //end $scope.$broadcast('evalPanes',
		} //end evalSelections fn


		var make_plot = function() {
			// clear/initialize the plots on the page
			$scope.plots = [];
			// selection_strs split ;; gives the panels, map over the panels with panel_index
			$scope.selection_strs.split(";;").map( function(panel, panel_index) { if (panel) {
				console.log("processing panel: " + (panel_index + 1));
				// split the panel request string into the two main components, which are
				// specification of lines to plot + $$ + config options
				var _ = panel.split("$$");
				var lines = _[0];
				if (!lines) { show_error("panel " + (panel_index + 1) + ": nothing to do"); return; }
				var confi = _[1];	
				var y_scale_type = "linear"; //default type for y_scale_type, just in case !confi
				if (confi) {
					// split the config options, first part is conditions and second
					// part specifies log or linear y axis
					var _ = confi.split("*");
					var conditions = _[0];
					y_scale_type = (_[1] == "true") ? "log" : "linear";
					var constrain = []; // init collection of parsed constraints 
					var highlight = []; // and highlights
					conditions.split(";").map( function( condition ) {
						var _ = condition.split("@");
						if (_[1] == 1) { //is a highlight
							highlight.push( _[0] );
						} else { //is a constraint
							constrain.push( _[0] );
						}
					} )
					constrain = constrain.join(";");
					// want constrain to either be empty string or end with ; so that the
					// str addition with $scope.timerange_construct below works in call
					// to dscovrDataAccess.getValues
					if (constrain && constrain.charAt(constrain.length-1) != ";") {
						constrain += ";";
					}
				} //end if config
				// this section (make y_label) basically pulls out the bz_gse from "m1m:bx_gse" strings
				// and also gets the units out of the params and puts the string "bx_gse [nT]"
				// into y_label
				if (lines.charAt(lines.length-1) == ";") {lines = lines.slice(0, -1)}
				var y_label = []
				var y_accessor = lines.split(";").map( function(line) {
					console.log(line);
					var _ = line.split(":")
					y_label.push( _[1] + " [" + $scope.params[_[0]][_[1]] + "]" );
					return _[1]
				}); 
				y_label.join(', ');
				// end (make y_lablel)
				show_info("panel " + (panel_index + 1) + ": requesting data");
				dscovrDataAccess.getValues2(lines, constrain+$scope.timerange_construct).then( function(d) {
					show_info("panel " + (panel_index + 1) + ": data received, parsing");
					//initialize some vars
					var i = 0; //loop iter counter
					var dt = 60*1000; //1 minute in ms, expected data time step
					var bad = false; //current measurement is bad
					var badprev = false; //previous measurement is bad
					var process = function() {
						//this while loop used to be while i+1 < d.length but
						// now gapnext will always be false when it gets to the end
						// of the array which will allow this routine to take out
						// fill values at the end, while it was missing these with i+1
						while (i < d.length) {
							// count the number of nulls (fill values @ cur time step)
							var nulls = 0;
							Object.keys(d[i]).map( function(f) {
								if (+d[i][f] == -9999 | +d[i][f] == -999) {
									nulls++;
									d[i][f] = null;
								}
							});
							// the time step is bad if all the values are null
							bad = Boolean(nulls == y_accessor.length)
							if (bad && badprev) {
								d.splice(i, 1);
								// below, we setTimeout to occasionally give control
								// elsewhere so that UI remains responsive
								setTimeout(process, 1);
							} else { //end if (bad && badprev)
								// see if there is missing time step before the next measurement
								var gapnext = Boolean(d[i+1] && d[i+1]["time"]-d[i]["time"] > dt)
								if (gapnext && !bad) {
									// if there is, we need to add a null measurement so that metrics
									// grphics doesn't connect the line between the two points
									d.splice(i+1, 0, d[i])
									Object.keys(d[i+1]).map( function(f) {
										if (f == "time") {
											d[i+1][f] = +d[i+1][f] + dt;
										} else {
											d[i+1][f] = null;
										}
									});
									badprev = true;
									i = i + 2;
								} else { //end if (gapnext && !bad)
									d[i].time = new Date(+d[i].time);
									badprev = bad
									i++;
								} //end if (gapnext && !bad) else
							} //end if (bad && badprev) else
						} //end while filter over data
					}; //end process
					process();
					if (d.length > 1) { // check that we have data worth plotting
						show_info("panel " + (panel_index + 1) + ": plot will appear below");
						var title = lines + " from "
						 + $scope.timerange_construct.split(";").map( function(d) {
							return new Date( Number(d.split(":")[3]) ).toISOString();
						}).join(" to "); // string for the title
						// append to $scope.plots so that ng-repeat directive sees and plots
						$scope.plots[panel_index] =  {
							y_accessor: y_accessor,
							data: d,
							title: title,
							y_scale_type: y_scale_type,
							y_label: y_label,
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
			evalSelections();
			var new_url = "/vis/ts/" + $scope.selection_strs + "/" + $scope.timerange_construct;
			if ($location.url() != new_url) { // if location changed
				if ($scope.can_plot) {
					$location.url(new_url); // chnage route, this reloads the controller
				}
			} else {
				show_error("request unchanged and aready fulfilled");
			}
		};

		$scope.timerange_construct = "";

		dscovrDataAccess.getParameters2().then( function(data) {
			$scope.params = data;
		});

		// $routeParams.arg holds info on panels, if present, try to parse
		if ($routeParams.arg) { 
			$scope.predef_cond = []
			$routeParams.arg.split(";;").map( function(d) {
				if (d) {$scope.predef_cond.push(d);}
			});
			console.log($scope.predef_cond);
		}
		// $routeParams.argg holds info on the date range, if present, try to parse
		if ($routeParams.argg) { 
			$scope.predef_time = [];
			//find the time range. The string should look like:
			// m1m:time:ge:1438927200000;m1m:time:le:1440050400000
			// 1  :2   :3 :4            ; repeat
			// part 1, ignore but should be m1m or f1m, just tells the data service
			// layer which table to get time from. They should be equivalent under
			// assumptions that we are using minute averaged data
			// part 2, tells us that this is a time condition
			// part 3, tells us that we are looking for times greater or equal to
			// part 4, the actual value of the condition
			$routeParams.argg.split(";").map( function(t) {
				t = t.split(":");
				if (t[1] == "time") {
					if (t[2] == "ge" || t[2] == "gt") {
						// ge or gt is minimum time bound so the timerange directive
						// expects it to be in position 0 of arr $scope.predef_time
						$scope.predef_time[0] = t[3];
					} else {
						// the other one should be the max time (most recent) and
						// fills position 1
						$scope.predef_time[1] = t[3];
					}
				} //end if (t[1] == "time)
			}); //end map over $rotueParams.arg.split(";")
		} //end if ($routeParams.argg)

		// if $routeParams.arg (ie. panels defined) that means we need to try to plot
		// b/c user is either pasting a fully created url or pressed go on the previous
		// page to get here. Just having a date range (ie $routeParams.argg) does not
		// necessarily mean we have something to plot.
		if ($routeParams.arg) {
			//this timeout is needed becuase otherwise
			//eval selections sends the broadcast before the
			//child directives are linked and so they don't hear.
			//This delays but TODO: make the deepest child emit
			// a message and catch it here that it is loaded.
			function waiting_until_ready() {
				if ($scope.params) {
					console.log("waiting_until_ready finished, calling eval");
					evalSelections(make_plot);
				} else { 
					console.log("waiting_until_ready not finished");
					$timeout( waiting_until_ready, 500 );
				}
			};
			waiting_until_ready();
		}


	});
