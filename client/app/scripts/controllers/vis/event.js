'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:VisEventCtrl
 * @description
 * # VisEventCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
	.controller('VisEventCtrl', function ($scope, $timeout,
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

		//when we need to get the conditions from the condition container
		// will broadcast evalConditions and give a callback which utilizes
		// the generated condition string.
		var evalConditions = function(cb) {
			show_info("evaluating request");
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
				$scope.$broadcast("evalConditions", function(condition_str) {
					if (condition_str) {
						$scope.condition_str = condition_str;
						$scope.can_plot = true;
						if (cb) {cb()};
					} else {
						// flash an error message if none of the conditions are valid
						$scope.can_plot = false;
						show_error("No valid conditions");
					}
				});
			});
		};

		var make_plot = function() {
			var conditions = $scope.condition_str;
			var timerange = $scope.timerange.slice();
			show_info("requesting data");
			dscovrDataAccess.getValues3("", timerange, conditions ).then( function( data ) {
				show_info("data received, plot is below");
				var trace = {
					x: [], y: [],
					mode: 'markers',
					type: 'scatter'
				};
				var i = 0;
				var process = function() {
					while (i < data.length) {
						trace.x.push( new Date(data[i].time) );
						trace.y.push( 1 );
						i++;
					}
				}
				process();
				$scope.plot = {
					traces: [trace],
					layout: {
						xaxis: {title: "time"},
						title: conditions + " is true",
					}
				}
			}, show_error);
		};

		$scope.go = function() {
			evalConditions( function() {
				var new_url = "/vis/event/" + $scope.timerange.join(":") 
					+ "/" + $scope.condition_str;
				if ($location.url() != new_url) { //if locations changed
					if ($scope.can_plot) {
						$location.url(new_url); //change route, reload the controller
					}
				} else if ($scope.can_plot) {
					show_error("request unchanged and already fulfilled");
				};
			});
		};

		dscovrDataAccess.getParameters2().then( function(data) {
			$rootScope.params = data;
		}, show_error);

		if ($routeParams.arg) {
			$scope.predef_time = $routeParams.arg.split(":").map( Number );
		}
		if ($routeParams.argg) {
			$scope.predef_cond = $routeParams.argg;
		}

		if ($routeParams.arg && $routeParams.argg) {
			var waiting_until_ready = function() {
				if ($rootScope.params && $scope.timerange_ready) {
					evalConditions(make_plot);
				} else { 
					$timeout( waiting_until_ready, 500 );
				}
			};
			waiting_until_ready();
		};

	});
