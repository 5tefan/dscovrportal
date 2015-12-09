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

		var check_data = function(data) {
			if (data.length <= 1) {
				$scope.error = "No data with specified conditions";
				$timeout(function() {
					$scope.error = "";
				}, 5000);
			}
			return data.length > 1;
		}

		// evaluate the selections from the main controller
		var evalSelections = function(cb) {
			//initialize the string we will be building, will look like
			// m1m:bx_gse;m1m:by_gse;;f1m:alpha_density where ; separate
			// parameters in the same plot and ;; separate different panes
			//  note: for formatting for the dscovr-data-access api do .split(";;").join(";")
			$scope.selection_strs = "";
			//ask the tsPaneContainer to tell us how many panes are in it so we
			// know how many to expect and when we are done evaluating.
			$scope.$broadcast('evalPanes', function(num_panes) {
				console.log(num_panes);
				var num_pane_responses = 0;
				//as the tsPaneEdit directives to send back their strings, we
				// put them all together and figure out when we have gotten them all
				$scope.$broadcast('evalSelections', function(selection_str) {
					++num_pane_responses;
					console.log(num_pane_responses);
					if (selection_str) {
						$scope.selection_strs += selection_str + ";;";
					}
					if (num_pane_responses == num_panes) {
						//after all panes respond, we will make request here, otherwise 
						// alert that we didnt get what we needed
						if ($scope.selection_strs) {
							console.log($scope.selection_strs);
							console.log($scope.timerange_construct);
							//make_plot();
							if (cb) { 
							console.log("hello");
								cb()
							 };
							$scope.can_plot = true;
						} else {
							// flash an error message if none of the panes are valid
							$scope.error = "please enter at least 1 valid pane";
							$timeout(function() {
								$scope.error = "";
							}, 5000);
						}
					
					};
				});
			});
		}


		var make_plot = function() {
			$scope.plots = [];
			// selection_strs split ;; gives the panels
			$scope.selection_strs.split(";;").map( function(panel) { if (panel) {
				var _ = panel.split("$$");
				var lines = _[0];
				var confi = _[1];
				var y_scale_type = "linear";
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
				if (lines.charAt(lines.length-1) == ";"){lines = lines.slice(0, -1)}
				var y_label = []
				var y_accessor = lines.split(";").map( function(line) {
					var _ = line.split(":")
					y_label.push( _[1] + " [" + $scope.params[_[0]][_[1]] + "]" );
					return _[1]
				});
				y_label.join(', ');

				dscovrDataAccess.getValues(lines, constrain+$scope.timerange_construct).then( function(d) {
					var i = 0;
					var dt = 60*1000;
					var bad = false;
					var badprev = false;
					while (i+1 < d.length) {
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
						} else {
							var gapnext = Boolean(d[i+1]["time"]-d[i]["time"] > dt)
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
					if (check_data(d)) {
						var title = lines + " from "
						 + $scope.timerange_construct.split(";").map( function(d) {
							return new Date( Number(d.split(":")[3]) ).toISOString();
						}).join(" to ");
						$scope.plots.push( {
							y_accessor: y_accessor,
							data: d,
							title: title,
							y_scale_type: y_scale_type,
							y_label: y_label,
						});
					}
				}); // end dscovrDataAccess getValues lines
			} } ); //end selection_strs map panel if panel
		}

		$scope.go = function() {
			evalSelections();
			if ($scope.can_plot) {
				$location.url("/vis/ts/" + $scope.selection_strs + 
					"/" + $scope.timerange_construct);
			}
		};

		if ($routeParams.arg) {
			$scope.predef_cond = []
			$routeParams.arg.split(";;").map( function(d) {
				if (d) {$scope.predef_cond.push(d);}
			});
			console.log($scope.predef_cond);
			$scope.predef_time = [0, 0];
			//find the time in the first one
			$routeParams.argg.split(";").map( function(t) {
				t = t.split(":");
				if (t[1] == "time") {
					if (t[2] == "ge") {
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
			$timeout( function() {
				console.log($scope.predef_time);
				evalSelections(make_plot);
			}, 1000);
			//$timeout(make_plot, 1000);
		}

		$scope.timerange_construct = "";

		dscovrDataAccess.getParameters().then( function(data) {
			$scope.params = data;
		});

	});
