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
			// iterate through panes
			console.log($scope.selection_strs);
			$scope.selection_strs.split(";;").map( function(selection) {
				if (selection) {
					var lines = selection.split(";").map(function(d) {
						return d.split(":")[1]
					});
					//inside this loop we will complete a single pane
					//specifically the pane with parameters described in selection
					dscovrDataAccess.getValues(selection, time).then( function(data) {
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
