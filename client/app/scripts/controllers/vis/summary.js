'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:VisSummaryCtrl
 * @description
 * # VisSummaryCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
  .controller('VisSummaryCtrl', function ($scope, $routeParams, $cookieStore, $location) {

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

	//= summary_file_date_formatter
	$scope.summary_frame_info = {
		"6h": {
			//dt is going to be 24 for 6h since 6h is going to place 4 plots on the screen
			dt: 1000 * 60 * 60 * 24,
			src: "plots/dscovr_6hr_plots/{{year}}/{{month}}/{{year}}{{month}}{{day}}{{hour}}-6hr.png"
		},
		"1d": {
			dt: 1000 * 60 * 60 * 24,
			src: "plots/dscovr_1day_plots/{{year}}/{{month}}/{{year}}{{month}}{{day}}-day.png"
		},
		"3d": {
			dt: 1000 * 60 * 60 * 24 * 3,
			src: "plots/dscovr_3day_plots/{{year}}/{{year}}{{month}}{{day}}-3day.png"
		},
		"7d": {
			dt: 1000 * 60 * 60 * 24 * 7,
			src: "plots/dscovr_7day_plots/{{year}}/{{year}}{{month}}{{day}}-7day.png"
		},
		"1m": {
			dt: 1000 * 60 * 60 * 24 * 32,
			src: "plots/dscovr_month_plots/{{year}}/{{year}}{{month}}-month.png"
		}
	};

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

/*

*/

		//initialize on the three day summary
		//a frame size must have a corresponding
		//summary_config option to be valid
		switch ($routeParams.arg) {
			//make sure the frame is one of these
			//6 hour, 1 day, 3 days, 7 days, 1 month
			case "6h":
			case "1d":
			case "3d":
			case "7d":
			case "1m":
				$scope.frame_size = $routeParams.arg;
				//if no time specified default to the latest, subtract extra 10 minutes to deal with 
				$scope.summary_date = moment.utc().subtract(1, 'days');
				if ( $routeParams.argg && mission_range.contains( $scope.parse_urldate($routeParams.argg) ) ) { 
					//test for argg which should be the time, valid time?
					//and parse it, also check if it is in mission range
					$scope.summary_date = $scope.parse_urldate($routeParams.argg);
				};
				$scope.timestring = $scope.make_urldate($scope.summary_date)
				//this is the date the picker will be initialized to
				$scope.selected_date = $scope.summary_date.format("YYYY-MM-DD");

	//calculate the difference between userselectdate and mission_start, divide by frame_size in ms to get number
	//of frames from the beginning, then construct date by adding beginning + frame_size * number of frames. An 
	//image should exist for the specified time.
				//the following seciton calculates the date for the file that the user requested date is plotted within
				//ie depends on frame size and user requested date
				if ($scope.frame_size == "3d" || $scope.frame_size == "7d") {
					//use epoch time to calculate what day is needed when
					//viewing a day in the 3 day or 7 day frames
					$scope.summary_file_date = moment.utc( 
						$scope.mission_start.toDate().getTime() 
						+ $scope.summary_frame_info[ $scope.frame_size ].dt 
						* Math.floor( 
							(moment.utc($scope.selected_date).toDate().getTime() - $scope.mission_start.toDate().getTime()) / $scope.summary_frame_info[ $scope.frame_size ].dt 
						) 
					);
				} else if ($scope.frame_size == "1d" || $scope.frame_size == "6h") {
					//when its one day or 6h, the day file path name 
					//is just the same as the day the user selects
					$scope.summary_file_date = moment.utc($scope.selected_date).startOf('day');
				} else if ($scope.frame_size == "1m") {
					$scope.summary_file_date = moment.utc($scope.selected_date).startOf('month')
				}
				//divide by 10000 to slim down url params, last bit always going to be 00000
				//set the end date of the frame, parameter for next frame
				$scope.summary_file_date_prev = moment.utc($scope.summary_file_date)
					.subtract( 0.5 * $scope.summary_frame_info[$scope.frame_size].dt, "ms");
				$scope.summary_file_date_end = moment.utc($scope.summary_file_date)
					.add( $scope.summary_frame_info[$scope.frame_size].dt, "ms");
				$scope.summary_file_date_next = moment.utc($scope.summary_file_date)
					.add( $scope.summary_frame_info[$scope.frame_size].dt, "ms");

				break;
			default:
				//if incorrect type parameter, default to:
				$location.url("/vis/summary/7d");
				return; //do not go on after location change
		}


	$scope.dateselect_locationchange = function() {
		if ($scope.selected_date) {
			var ensure_date = moment($scope.selected_date);
			$location.url("/vis/summary/" + $routeParams.arg + "/" + $scope.make_urldate( ensure_date ));
		} else {
			//TODO: warn about incorrect date?
		}
	}

	//formats the summary_frame_info url string to the current user
	//selected date
	$scope.get_plotsrc = function() {
		//console.log( $scope.summary_file_date );
		var src = $scope.summary_frame_info[$scope.frame_size].src;
		src = src.split("{{year}}").join( $scope.summary_file_date.format("YYYY") )
		src = src.split("{{month}}").join( $scope.summary_file_date.format("MM") )
		src = src.split("{{day}}").join( $scope.summary_file_date.format("DD") )
		return src;
	}
	$scope.get_plotsrc_6h = function(hour) {
		//console.log( $scope.summary_file_date );
		var src = $scope.summary_frame_info[$scope.frame_size].src;
		src = src.split("{{year}}").join( $scope.summary_file_date.format("YYYY") )
		src = src.split("{{month}}").join( $scope.summary_file_date.format("MM") )
		src = src.split("{{day}}").join( $scope.summary_file_date.format("DD") )
		if (hour < 10) {
			src = src.split("{{hour}}").join( "0" + hour );
		} else {
			src = src.split("{{hour}}").join( hour );
		}
		return src;
	}

});
