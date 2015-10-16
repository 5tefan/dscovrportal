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
			var time = $scope.timerange_construct;
			// iterate through panes
			console.log($scope.selection_strs);
			$scope.selection_strs.split(";;").map( function(selection) {
				if (selection) {
					var _ = selection.split("$$");
					selection = _[0];

					if (_[1]) {
						var condition = _[1].split("*")[0];
						var highlight = [];
						var exclude = [];
						condition.split(";").map( function(d) {
							var splitted = d.split("_");
							if (splitted[1] == 0) {
								exclude.push(splitted[0]);
							} else {
								highlight.push(splitted[0]);
							}
						});
						highlight = highlight.join(";");
						exclude = exclude.join(";");
						if (highlight && highlight.charAt(highlight.length-1) != ";") {
							highlight += ";";
						}
						if (exclude && exclude.charAt(exclude.length-1) != ";") {
							exclude += ";";
						}
					}
					var logscale = Boolean(selection.split("*")[1]);
					console.log(highlight);
					if (selection.charAt(selection.length-1) == ";") { selection = selection.slice(0, -1); }
					var lines = selection.split(";").map(function(d) {
						return d.split(":")[1]
					});
					//inside this loop we will complete a single pane
					//specifically the pane with parameters described in selection

					//These variables will help filtering the data after we make all the requests we need
					var i = 0;
					var bad = false;
					var badprev = false;
					dscovrDataAccess.getValues(selection, time).then( function(data) {
						if (highlight) { //if we have data to highlight specified in the advanced options
							dscovrDataAccess.getValues(selection, highlight+time).then( function(hdata) {
								var hdata_lookup = []
								for (var h in hdata) {
									hdata_lookup.push(hdata[h].time);
								}
								var inhighlight = false;
								if (exclude) {
									// this is the case highlight AND exclude
									dscovrDataAccess.getValues(selection, exclude+time).then( function(edata) {
										var edata_lookup = [];
										for (var e in edata) {
											edata_lookup.push(edata[e].time);
										}
										while (i < data.length) {
											//null fill values and decide if we have a 
											//sequence of nulls we can get rid of
											var edata_index = edata_lookup.indexOf(data[i].time);
											if (edata_index != -1) {
												if (badprev) {
													//if prev was bad then just splice
													data.splice(i, 1);
													edata_lookup.splice(edata_index, 1);
												} else {
													//otherwise insert a null so that we get a gap
													Object.keys(data[i]).map( function(k) {
														if (k != "time") {
															data[i][k] = null;
														};
													});
													edata_lookup.splice(edata_index, 1);
													badprev = true;
												}
													
											} else {
												var nulls = 0;
												Object.keys(data[i]).map( function(k) {
													if (+data[i][k] == -9999 | +data[i][k] == -999) {
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
													var hdata_index = hdata_lookup.indexOf(data[i].time);
													if (!bad && hdata_index > -1) {
														Object.keys(hdata[hdata_index]).map( function(k) {
															if (k != 'time') {
																if (+hdata[hdata_index][k] != -9999) {
																	data[i]["condition" + k] = hdata[hdata_index][k];
																} else {
																	data[i]["condition" + k] = null;
																}
															}
														});
													} else if (!bad && hdata_index == -1) {
														Object.keys(data[i]).map( function(k) {
															if (k != 'time') {
																data[i]["condition" + k] = null;
															}
														});
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
										}

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
										//this is ugly buuuut... necessary to get the lines to highlight
										// with metricsgraphics
										$timeout(function() { 
											var s = 2;
											while (s < y_acc.length+1) {
												d3.select(".mg-line" + s + "-color")
													.style({"stroke-width": 5});
												s += 2;
											}
										}, 3000);
									});
								} else {
									//case highlight AND no exclude
									while (i < data.length) {
										//null fill values and decide if we have a 
										//sequence of nulls we can get rid of
										var nulls = 0;
										Object.keys(data[i]).map( function(k) {
											if (+data[i][k] == -9999 | +data[i][k] == -999) {
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
											var hdata_index = hdata_lookup.indexOf(data[i].time);
											if (!bad && hdata_index > -1) {
												Object.keys(hdata[hdata_index]).map( function(k) {
													if (k != 'time') {
														if (+hdata[hdata_index][k] != -9999) {
															data[i]["condition" + k] = hdata[hdata_index][k];
														} else {
															data[i]["condition" + k] = null;
														}
													}
												});
											} else if (!bad && hdata_index == -1) {
												Object.keys(data[i]).map( function(k) {
													if (k != 'time') {
														data[i]["condition" + k] = null;
													}
												});
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
									//this is ugly buuuut... necessary to get the lines to highlight
									// with metricsgraphics
									$timeout(function() { 
										var s = 2;
										while (s < y_acc.length+1) {
											d3.select(".mg-line" + s + "-color")
												.style({"stroke-width": 5});
											s += 2;
										}
									}, 3000);
								}

							});
						} else { //else no highlight
							// this is the case when we dont have a highlight but possibly an exclude
							if (exclude) {
								dscovrDataAccess.getValues(selection, exclude+time).then( function(edata) {
									var edata_lookup = [];
									for (var e in edata) {
										edata_lookup.push(edata[e].time);
									}
									while (i < data.length) {
										//null fill values and decide if we have a 
										//sequence of nulls we can get rid of
										var edata_index = edata_lookup.indexOf(data[i].time);
										if (edata_index != -1) {
											if (badprev) {
												//if prev was bad then just splice
												data.splice(i, 1);
												edata_lookup.splice(edata_index, 1);
											} else {
												//otherwise insert a null so that we get a gap
												Object.keys(data[i]).map( function(k) {
													if (k != "time") {
														data[i][k] = null;
													};
												});
												edata_lookup.splice(edata_index, 1);
												badprev = true;
											}
												
										} else {
											var nulls = 0;
											Object.keys(data[i]).map( function(k) {
												if (+data[i][k] == -9999 | +data[i][k] == -999) {
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
									return;
								});
							} else {
								while (i < data.length) {
									//null fill values and decide if we have a 
									//sequence of nulls we can get rid of
									var nulls = 0;
									Object.keys(data[i]).map( function(k) {
										if (+data[i][k] == -9999 | +data[i][k] == -999) {
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
						}

					}); //end dscovrDataAccess.getValues(selection, time).then( function(data) {
				} //end if (selection) {
			}); //end $scope.selection_strs.split(";;").map( function(selection) {
		};

		$scope.go = function() {
			evalSelections();
			if ($scope.can_plot) {
				console.log("/vis/ts/" + $scope.selection_strs + $scope.timerange_construct);
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
				evalSelections(make_plot);
			}, 1000);
			//$timeout(make_plot, 1000);
		}

		$scope.timerange_construct = "";

		dscovrDataAccess.getParameters().then( function(data) {
			$scope.params = data;
		});

	});
