'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:VisAdvancedCtrl
 * @description
 * # VisAdvancedCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
  .controller('VisAdvancedCtrl', function ($scope, $routeParams, $cookieStore, $location) {

	$scope.mission_start = moment.utc("02-03-2015", "DD-MM-YYYY");
	$scope.mission_end = moment.utc("12-12-2015", "DD-MM-YYYY");
	var mission_range = moment.range($scope.mission_start, $scope.mission_end);

	//these are wrapper functions for converting to and from url parameters
	//useful so that you only have to change these two values if we need to
	//change the resolution avaialable in the parameter space. Perhaps also 
	//may be needed for the dynamic plotting, variable resolution depending on 
	//the type of visualization
	$scope.make_urldate = function(dadate) {
		return moment.utc(dadate).toDate().getTime()/100000;
	}
	$scope.parse_urldate = function(danumberz) {
		return moment.utc(danumberz * 100000);
	}


/*
	//restore what they had if they go somewhere else and
	//then come back to the visualize tab, it will look like
	//it "remembers" where they were
	if ( !$routeParams.type && !$routeParams.frame) {
		if ($cookieStore.get('last_vis')) {
			$location.url($cookieStore.get('last_vis'));
		}
	}

	//If they are changing location to another page within the 
	//visulaize tab, record 
	$scope.$on('$locationChangeStart', function(event, data) {
		if ($location.path().split("/")[1] == "vis") {
			$cookieStore.put('last_vis', $location.url());
		}
	});
*/


});
