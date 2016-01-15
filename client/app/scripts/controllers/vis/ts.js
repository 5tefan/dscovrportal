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

		var check_data = function(data) {
			if (data.length <= 1) {
				show_error("No data with specified conditions");
			}
			return data.length > 1;
		}

		// evaluate the selections from the main controller
		var evalSelections = function(cb) {
			show_info("evaluating request");
			// first, do some date validation, end date is after begin date or throw error and do not continue
			var datesplit = $scope.timerange_construct.split(';');
			var begindate = Number(datesplit[0].split(':')[3]);
			var endindate = Number(datesplit[1].split(':')[3]);
			if (!begindate || !endindate) {
				show_error("no time range selected");
				$scope.can_plot = false;
				return;
			} else if (begindate >= endindate) {
				show_error("end date is not after start date");
				$scope.can_plot = false;
				return;
			}
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
					console.log("evalPanes received # responses: " + num_pane_responses);
					if (selection_str) {
						++num_pane_responses;
						$scope.selection_strs += ($scope.selection_strs ? ';;' : '') + selection_str;
					}
					if (num_pane_responses == num_panes) {
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
						}
					
					};
				});
			});
		}


		var make_plot = function() {
			$scope.plots = [];
			// selection_strs split ;; gives the panels
			$scope.selection_strs.split(";;").map( function(panel, panel_index) { if (panel) {
				console.log("processing panel: " + (panel_index + 1));
				var _ = panel.split("$$");
				var lines = _[0];
				if (!lines) { show_error("panel " + (panel_index + 1) + ": nothing to do"); return; }
				var confi = _[1];	
				var y_scale_type = "linear"; //default type for y_scale_type
				if (confi) {
					var _ = confi.split("*");
					var conditions = _[0];
					y_scale_type = (_[1] == "true") ? "log" : "linear";
					var constrain = [];
					var highlight = [];
					conditions.split(";").map( function( condition ) {
						var _ = condition.split("@");
						if (_[1] == 1) { //is a highlight
							highlight.push( _[0] );
						} else { //is a constraint
							constrain.push( _[0] );
						}
					} )
					highlight = highlight.join(";");
					if (highlight && highlight.charAt(highlight.length-1) != ";") {
						highlight += ";";
					}
					constrain = constrain.join(";");
					if (constrain && constrain.charAt(constrain.length-1) != ";") {
						constrain += ";";
					}
				} //end if config
				// this next section basically pulls out the bz_gse from "m1m:bx_gse" strings
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

				show_info("panel " + (panel_index + 1) + ": requesting data");
				dscovrDataAccess.getValues2(lines, constrain+$scope.timerange_construct).then( function(d) {
					show_info("panel " + (panel_index + 1) + ": data received, parsing");
					var i = 0;
					var dt = 60*1000; //1 minute in ms
					var bad = false;
					var badprev = false;
					var process = function() {
						//this while loop used to be while i+1 < d.length but
						// gapnext will always be false when it gets to the end
						// of the array which will allow this routine to take out
						// fill values at the end, while it was missing these with i+1
						while (i < d.length) {
							var nulls = 0;
							Object.keys(d[i]).map( function(f) {
								if (+d[i][f] == -9999 | +d[i][f] == -999) {
									nulls++;
									d[i][f] = null;
								}
							});
							bad = Boolean(nulls == y_accessor.length)
							if (bad && badprev) {
								d.splice(i, 1);
								// below, we setTimeout to occasionally give control
								// elsewhere so that UI remains responsive
								setTimeout(process, 1);
							} else {
								var gapnext = Boolean(d[i+1] && d[i+1]["time"]-d[i]["time"] > dt)
								if (gapnext && !bad) {
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
								} else {
									d[i].time = new Date(+d[i].time);
									badprev = bad
									i++;
								}
							}
						} //end while filter over data
					}; //end process
					process();
					if (check_data(d)) {
						var title = lines + " from "
						 + $scope.timerange_construct.split(";").map( function(d) {
							return new Date( Number(d.split(":")[3]) ).toISOString();
						}).join(" to ");
						show_info("panel " + (panel_index + 1) + ": plot will appear below");
						$scope.plots[panel_index] =  {
							y_accessor: y_accessor,
							data: d,
							title: title,
							y_scale_type: y_scale_type,
							y_label: y_label,
						};
					}
				}, function(err_msg) { show_error("Panel " + (panel_index + 1) + ": " + err_msg) }); // end dscovrDataAccess getValues lines
			} } ); //end selection_strs map panel if panel
		}

		$scope.go = function() {
			evalSelections();
			var new_url = "/vis/ts/" + $scope.selection_strs + "/" + $scope.timerange_construct;
			if ($location.url() != new_url) {
				if ($scope.can_plot) {
					$location.url("/vis/ts/" + $scope.selection_strs + 
						"/" + $scope.timerange_construct);
				}
			} else {
				show_error("request unchanged and aready fulfilled");
			}
		};

		$scope.timerange_construct = "";
		$scope.params_ready = false;

		dscovrDataAccess.getParameters2().then( function(data) {
			$scope.params = data;
			$scope.params_ready = true;
		});

		if ($routeParams.arg) {
			$scope.predef_cond = []
			$routeParams.arg.split(";;").map( function(d) {
				if (d) {$scope.predef_cond.push(d);}
			});
			console.log($scope.predef_cond);
			$scope.predef_time = [];
			//find the time in the first one
			$routeParams.argg.split(";").map( function(t) {
				t = t.split(":");
				if (t[1] == "time") {
					if (t[2] == "ge" || t[2] == "gt") {
						$scope.predef_time[0] = t[3];
					} else {
						$scope.predef_time[1] = t[3];
					}
				}
			});
			//this timeout is needed becuase otherwise
			//eval selections sends the broadcast before the
			//child directives are linked and so they don't hear.
			//This delays but TODO: make the deepest child emit
			// a message and catch it here that it is loaded.
			function waiting_until_ready() {
				if ($scope.params_ready) {
					console.log("waiting_until_ready finished, calling eval");
					evalSelections(make_plot);
				} else { 
					console.log("waiting_until_ready not finished");
					$timeout( waiting_until_ready, 500 );
				}
			};
			waiting_until_ready();
			//$timeout(make_plot, 1000);
		}


	});
