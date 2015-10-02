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

		var filter_data = function(data) {
			//now we have the data in data. Need to filter
			var i = 0;
			var bad = false;
			var badprev = false;
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
				// we declare this time step bad if all the data
				// values are null
				bad = Boolean(nulls == lines.length);
				// if its bad and the one before it is bad, remove it
				if (bad && badprev) {
						data.splice(i, 1);
				} else {
					if (highlight) {
						var index = highlight_data_lookup.indexOf(data[i].time);
						if (index > -1) {
							Object.keys(highlight_data[index]).map( function(k) {
								data[i]["condition" + k] = highlight_data[index][k];
							});
						}
					}
					// otherwise this is the first bad one, we need
					// to keep it so that the line will not interpolate
					// but need to set bad so that the next ones will be
					//removed
					data[i].time = new Date(+data[i].time);
					badprev = bad;
					i++;
				}
			}
			return data;
		}

		var make_plot = function() {
			$scope.plots = [];
			var time = $scope.timerange_construct;
			// iterate through panes
			console.log($scope.selection_strs);
			$scope.selection_strs.split(";;").map( function(selection) {
				if (selection) {
					var _ = selection.split("$$");
					selection = _[0];
					var highlight = _[1];
					console.log(selection);
					console.log(highlight);
					var lines = selection.slice(0, -1).split(";").map(function(d) {
						return d.split(":")[1]
					});
					//inside this loop we will complete a single pane
					//specifically the pane with parameters described in selection
					dscovrDataAccess.getValues(selection, time).then( function(data) {
						if (highlight) { //if we have data to highlight specified in the advanced options
							var hdata_lookup = []
							dscovrDataAccess.getValues(selection, highlight+";"+time).then( function(hdata) {
								for (var h in hdata) {
									hdata_lookup.push(hdata[h].time);
								}

								//now we have the data in data. Need to filter
								var i = 0;
								var bad = false;
								var badprev = false;
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
									// we declare this time step bad if all the data
									// values are null
									bad = Boolean(nulls == lines.length);
									// if its bad and the one before it is bad, remove it
									if (bad && badprev) {
											console.log("splice!");
											data.splice(i, 1);
									} else {
										var index = hdata_lookup.indexOf(data[i].time);
										if (index > -1) {
											Object.keys(hdata[index]).map( function(k) {
												if (k != 'time') {
													if (+hdata[index][k] != -9999) {
														data[i]["condition" + k] = hdata[index][k];
													} else {
														data[i]["condition" + k] = null;
													}
												}
											});
											// if this is the last highlighted value for a while, instert a null
											// so that metricsgraphics doesnt interpolate between the poitns
											if (i+1 < data.length && hdata_lookup.indexOf(data[i+1].time) == -1) {
												Object.keys(hdata[index]).map( function(k) {
													if (k != 'time') {
														data[i]["condition" + k] = null;
													}
												});
											}
										}
											
									
										// otherwise this is the first bad one, we need
										// to keep it so that the line will not interpolate
										// but need to set bad so that the next ones will be
										//removed
										data[i].time = new Date(+data[i].time);
										badprev = bad;
										i++;
									}
								}
								console.log(data);
								//data is clean, just stuff we need to make the plot
								var title = selection + " from " + time.split(";").map( function(d) {
									return new Date( Number( d.split(":")[3] ) ).toISOString();
								}).join(" to ");
								var y_acc = [];
								lines.map( function(line) { y_acc.push(line); y_acc.push("condition"+line); });
								$scope.plots.push( {
									y_accessor: y_acc,
									data: data,
									title: title
								});
								//this is ugly buuuut...
								$timeout(function() { 
									var s = 2;
										console.log("bitches");
									while (s < y_acc.length+1) {
										d3.select(".mg-line" + s + "-color")
											.style({"stroke-width": 5});
										s += 2;
									}
								}, 3000);
							});
						} else {
							//now we have the data in data. Need to filter
							var i = 0;
							var bad = false;
							var badprev = false;
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
								// we declare this time step bad if all the data
								// values are null
								bad = Boolean(nulls == lines.length);
								// if its bad and the one before it is bad, remove it
								if (bad && badprev) {
										data.splice(i, 1);
								} else {
									// otherwise this is the first bad one, we need
									// to keep it so that the line will not interpolate
									// but need to set bad so that the next ones will be
									//removed
									data[i].time = new Date(+data[i].time);
									badprev = bad;
									i++;
								}
							}
							//data is clean, just stuff we need to make the plot
							var title = selection + " from " + time.split(";").map( function(d) {
								return new Date( Number( d.split(":")[3] ) ).toISOString();
							}).join(" to ");
							$scope.plots.push( {
								y_accessor: lines,
								data: data,
								title: title
							});
						}

					}); //end dscovrDataAccess.getValues(selection, time).then( function(data) {
				} //end if (selection) {
			}); //end $scope.selection_strs.split(";;").map( function(selection) {
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
