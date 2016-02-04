'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:VisEventCtrl
 * @description
 * # VisEventCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
	.controller('VisEventCtrl', function ($scope, $timeout, dscovrDataAccess, $routeParams, $location) {

		$scope.plot = {};
		$scope.can_plot = false;
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
			$scope.$broadcast("evalConditions", function(condition_str) {
				if (condition_str) {
					$scope.criteria = condition_str;
					$scope.can_plot = true;
				} else {
					// flash an error message if none of the conditions are valid
					$scope.can_plot = false;
					show_error("No valid conditions");
				}
				if (cb) {cb()};
			});
		};

		var make_plot = function() {
			evalConditions( function() {
				var criteria = $scope.criteria;
				var time = $scope.timerange_construct;
				show_info("requesting data");
				dscovrDataAccess.getValues2("", criteria + time).then( function( data ) {
					show_info("data received");
					show_info("plot is below");
					$scope.plot = {
						data: data,
						title: criteria,
					}
				}, show_error);
			});
		};

		$scope.go = function() {
			evalConditions( function() {
				var new_url = "/vis/event/" + $scope.criteria + $scope.timerange_construct;
				if ($location.url() != new_url) { //if locations changed
					if ($scope.can_plot) {
						$location.url(new_url); //change route, reload the controller
					}
				} else if ($scope.can_plot) {
					show_error("request unchanged and already fulfilled");
				};
			});
		};

		$scope.timerange_construct = "";

		dscovrDataAccess.getParameters2().then( function(data) {
			$scope.params = data;
		}, show_error);

		if ($routeParams.arg) {
			$scope.predef_cond = []
			$scope.predef_time = []
			$routeParams.arg.split(";").map( function(str_cond) {
				str_cond = str_cond.split(":");
				if (str_cond[1] == "time") {
					if (str_cond[2] == "ge" || str_cond[2] == "gt") {
						$scope.predef_time[0] = str_cond[3];
					} else {
						$scope.predef_time[1] = str_cond[3];
					}
				} else {
					$scope.predef_cond.push( str_cond )
				}
			});

			function waiting_until_ready() {
				if ($scope.params) {
					//console.log("waiting_until_ready finished, calling eval");
					make_plot();
				} else { 
					//console.log("waiting_until_ready not finished");
					$timeout( waiting_until_ready, 500 );
				}
			};
			waiting_until_ready();
		};



	});
