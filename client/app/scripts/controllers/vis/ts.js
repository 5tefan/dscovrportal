'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:VisTsCtrl
 * @description
 * # VisTsCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
	.controller('VisTsCtrl', function ($scope, $timeout, dscovrDataAccess) {
		$scope.timerange_construct = "";
		dscovrDataAccess.getParameters().then( function(data) {
			$scope.params = data;
		});

		var make_plot = function() {
			$scope.plots = [];
			var time = $scope.timerange_construct;
			$scope.selection_strs.split(";;").map( function(selection) {
				var lines = selection.split(";");
				//inside this loop we will complete a single pane
				//specifically the pane with parameters described in selection
				dscovrDataAccess.getValues(selection, time).then( function(data) {
					//now we have the data in data. Need to filter
					var i = 0;
					while (i < data.length) {
						//null fill values and decide if we have a 
						//sequence of nulls we can get rid of
						var nulls = 0;
						Object.keys(data[i]).map( function(k) {
							if (+data[i][k] == -9999) {
								nulls++;
								data[i][k] = null;
							};
						});
						var bad = Boolean(nulls == lines.length);
						if (bad && i>=1 && data[i-1].bad) {
								data.splice(i, 1);
						} else {
							data[i].time = new Date(+data[i].time);
							data[i].bad = bad;
							i++;
						}
					}
					console.log(data);
				});
			});
/*
			var params = $scope.selection_strs.split(";;").join(";");
			var selection = $scope.selection_strs;
			var time = $scope.timerange_construct;
			dscovrDataAccess.getValues(params, $scope.timerange_construct).then( function( data ) {
				//iterate through panes
				var step = selection.split(";;").map( function(pane) {
					var ret = "";
					pane.split(";").map( function(line) {
						if (line) {
							ret += line.split(":")[1] + ",";
						}
					})
					return ret;
				});
				var cleandata = [];
				for (var dt in data) {
					var dirty = [];
					Object.keys(data[dt]).map( function(k) {
						if (+d[k] == -9999) {
							dirty.push(true);
							data[dt][k] = null;
						} else {
							dirty.push(false);
						}
					});
					var has_null = Boolean(dirty.reduce(function(a, b) {return a+b})-1)
					if (dirty.reduce(function(a, b) {return a+b}) > 1 && dt >= 1) {
						if (cleandata[dt-1].dirty = true) {
							//dont add dt to clean then
						
					}
					cleandata.push( {
						time: new Date(+data[dt].time),
						
				}
				data = data.filter( function(d) {
					//parse the date from ms to date object
					d.time = new Date(+d.time);
					//filter out fill values (-9999) which are strings at this point
					Object.keys(d).map( function(k) {
						if (+d[k] == -9999) {
							d[k] = null;
						}
					});
					return d;
				});
				console.log(data);
				$scope.plots = [];
				step.map( function(plot) {
					if (plot) {
						var title = plot.split(",").join(", ").slice(0,-2) + " from " + time.split(";").map( function(d) {
							var a = new Date( Number( d.split(":")[3] ) );
							return a.toISOString();
						}).join(" to ");
						var plot = {	y_accessor: plot.split(","),
										data: data,
										title: title };
						$scope.plots.push(plot);
					}
				});
			});
*/
		};

		// evaluate the selections from the main controller
		$scope.evalSelections = function() {
			//initialize the string we will be building, will look like
			// m1m:bx_gse;m1m:by_gse;;f1m:alpha_density where ; separate
			// parameters in the same plot and ;; separate different panes
			//  note: for formatting for the dscovr-data-access api do .split(";;").join(";")
			$scope.selection_strs = "";
			//ask the tsPaneContainer to tell us how many panes are in it so we
			// know how many to expect and when we are done evaluating.
			$scope.$broadcast('evalPanes', function(num_panes) {
				var num_pane_responses = 0;
				//as the tsPaneEdit directives to send back their strings, we
				// put them all together and figure out when we have gotten them all
				$scope.$broadcast('evalSelections', function(selection_str) {
					++num_pane_responses;
					if (selection_str) {
						$scope.selection_strs += selection_str + ";";
					}
					if (num_pane_responses == num_panes) {
						//after all panes respond, we will make request here, otherwise 
						// alert that we didnt get what we needed
						if ($scope.selection_strs) {
							console.log($scope.selection_strs);
							console.log($scope.timerange_construct);
							make_plot();
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
	});
