'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:VisSummaryCtrl
 * @description
 * # VisSummaryCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
	.controller('VisSummaryCtrl', function ($scope, $routeParams, $cookieStore, $location, $route, dscovrUtil) {

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
				dt: 1000 * 60 * 60 * 24 * 28,
				src: "plots/dscovr_month_plots/{{year}}/{{year}}{{month}}-month.png"
			}
		};

		$scope.parse_args = function(arg, argg) {
			//a frame size must have a corresponding
			//summary_config option to be valid
			switch (arg) {
				//make sure the frame is one of these
				//6 hour, 1 day, 3 days, 7 days, 1 month
				case "6h":
				case "1d":
				case "3d":
				case "7d":
				case "1m":
					$scope.frame_size = arg;
					if (dscovrUtil.dateInRange( argg )) {
						$scope.summary_date = moment.utc( +argg ).toDate();
					} else {
						$scope.summary_date = moment.utc().subtract(1, 'days').toDate();
					};

					//calculate the difference between userselectdate and mission_start, divide by 
					//frame_size in ms to get number of frames from the beginning, then construct 
					//date by adding beginning + frame_size * number of frames. An image should
					//exist for the specified time.
					if ($scope.frame_size == "3d" || $scope.frame_size == "7d") {
						//use epoch time to calculate what day is needed when
						//viewing a day in the 3 day or 7 day frames
						$scope.summary_file_date = moment.utc( 
							dscovrUtil.getMissionBegin().valueOf() 
							+ $scope.summary_frame_info[ $scope.frame_size ].dt 
							* Math.floor( 
								($scope.summary_date.valueOf() - dscovrUtil.getMissionBegin().valueOf()) 
								/ $scope.summary_frame_info[ $scope.frame_size ].dt 
							) 
						);
					} else if ($scope.frame_size == "1d" || $scope.frame_size == "6h") {
						//when its one day or 6h, the day file path name 
						//is just the same as the day the user selects
						$scope.summary_file_date = moment.utc($scope.summary_date).startOf('day');
					} else if ($scope.frame_size == "1m") {
						$scope.summary_file_date = moment.utc($scope.summary_date).startOf('month')
					};

					//set the end date of the frame, parameter for next frame
					if ($scope.frame_size == "1m") {
						$scope.summary_prev_ms = moment.utc($scope.summary_date).subtract(1, 'months').valueOf();
						$scope.summary_end_ms = moment.utc($scope.summary_file_date).add(1, 'months').valueOf();
					} else {
						$scope.summary_prev_ms = +$scope.summary_date 
							- ($scope.summary_frame_info[$scope.frame_size].dt);
						$scope.summary_end_ms = +$scope.summary_file_date
							+ $scope.summary_frame_info[$scope.frame_size].dt;
					}

					break;
				default:
					//if incorrect type parameter, default to:
					$location.url("/vis/summary/7d");
					$location.replace();
					$scope.parse_args("7d");
			} //end switch on arg
		};

		//initialize the page with $routeParams.arg and argg
		$scope.parse_args($routeParams.arg, $routeParams.argg);

		// see http://stackoverflow.com/a/14329570
		// prevents refresh on route change
		var lastRoute = $route.current;
		$scope.$on('$locationChangeSuccess', function(event) {
			if ($route.current.$$route.controller == 'VisSummaryCtrl') {
				$route.current = lastRoute;
			};
		});

		$scope.locationchange = function(optional_new_frame_size, optional_new_ms) {
			// the optional_new_frame_size argument is an optional new frame size!
			// this is the locationchange function used by both clicking frame sizes
			// and as a callback from the date pick directive. The date picker directive
			// does not give any arguments onchange callback
			$scope.frame_size = optional_new_frame_size || $scope.frame_size;
			var new_time = (optional_new_ms || $scope.summary_date.valueOf());
			$location.url("/vis/summary/" + $scope.frame_size + "/" + new_time);
			//change the url ^ but still reparse with the new frame size and date range 
			//in $scope.parse_args now that we are intercepting the $locationChangeSuccess event
			$scope.parse_args($scope.frame_size, new_time);
		}

		//formats the summary_frame_info url string to the current user selected date
		$scope.get_plotsrc = function() {
			//console.log( $scope.summary_file_date );
			if ($scope.frame_size) {
				var src = $scope.summary_frame_info[$scope.frame_size].src;
				src = src.split("{{year}}").join( $scope.summary_file_date.format("YYYY") )
				src = src.split("{{month}}").join( $scope.summary_file_date.format("MM") )
				src = src.split("{{day}}").join( $scope.summary_file_date.format("DD") )
				return src;
			};
		};
		$scope.get_plotsrc_6h = function(hour) {
			//console.log( $scope.summary_file_date );
			if ($scope.frame_size) {
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
			};
		};

		
	});
