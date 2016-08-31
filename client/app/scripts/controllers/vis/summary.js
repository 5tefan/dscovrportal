'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:VisSummaryCtrl
 * @description
 * # VisSummaryCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
	.controller('VisSummaryCtrl', function ($scope, $routeParams, $cookieStore,
	 $location, $route, dscovrUtil) {

		$scope.summary_frame_info = {
			"6h": {
				//dt is going to be 24 for 6h since 6h is going to place 4 plots on the screen
				dt: 1000 * 60 * 60 * 24,
				src: "dscovr_6hr_plots/{{year}}/{{month}}/{{year}}{{month}}{{day}}{{hour}}-6hr.png"
			},
			"1d": {
				dt: 1000 * 60 * 60 * 24,
				src: "dscovr_1day_plots/{{year}}/{{month}}/{{year}}{{month}}{{day}}-day.png"
			},
			"3d": {
				dt: 1000 * 60 * 60 * 24 * 3,
				src: "dscovr_3day_plots/{{year}}/{{year}}{{month}}{{day}}-3day.png"
			},
			"7d": {
				dt: 1000 * 60 * 60 * 24 * 7,
				src: "dscovr_7day_plots/{{year}}/{{year}}{{month}}{{day}}-7day.png"
			},
			"1m": {
				dt: 1000 * 60 * 60 * 24 * 28,
				src: "dscovr_month_plots/{{year}}/{{year}}{{month}}-month.png"
			}
		};
                var summary_image_base = "//www.ngdc.noaa.gov/dscovr/plots/";
	
		$scope.to_utc_ms = function(non_utc_ms) {
			var utcoffset = moment().utcOffset();
			return +moment(non_utc_ms).add(utcoffset, 'minutes');
		}

	
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
						$scope.summary_date = moment(+argg).startOf('day').toDate();
					} else {
						// while serving as default date, also means that trying to 
						// go earlier than the start date loops to the beginning
						$scope.summary_date = dscovrUtil.getMissionEnd().startOf('day').toDate();
					};

					//calculate the difference between userselectdate and mission_start, divide by 
					//frame_size in ms to get number of frames from the beginning, then construct 
					//date by adding beginning + frame_size * number of frames. An image should
					//exist for the specified time.
					if ($scope.frame_size == "3d" || $scope.frame_size == "7d") {
						//use epoch time to calculate what day is needed when
						//viewing a day in the 3 day or 7 day frames
						$scope.summary_file_date = moment( 
							+dscovrUtil.getMissionBegin() + $scope.summary_frame_info[$scope.frame_size].dt 
							* Math.floor( 
								(+$scope.summary_date - dscovrUtil.getMissionBegin()) 
								/ $scope.summary_frame_info[ $scope.frame_size ].dt 
							) 
						);
						var int_frame_size = Number.parseInt($scope.frame_size);
						$scope.summary_prev_ms = +moment($scope.summary_date).subtract(
							int_frame_size, 'days'
						);
						$scope.summary_end_ms = +moment($scope.summary_date).add(
							int_frame_size, 'days'
						);
					} else if ($scope.frame_size == "1d" || $scope.frame_size == "6h") {
						//when its one day or 6h, the day file path name 
						//is just the same as the day the user selects
						$scope.summary_file_date = moment($scope.summary_date).startOf('day');
						$scope.summary_prev_ms = +moment($scope.summary_date).subtract(1, 'days');
						$scope.summary_end_ms = +moment($scope.summary_date).add(1, 'days');
					} else if ($scope.frame_size == "1m") {
						$scope.summary_file_date = moment($scope.summary_date).startOf('month')
						$scope.summary_prev_ms = +moment($scope.summary_date).subtract(1, 'months');
						$scope.summary_end_ms = +moment($scope.summary_date).add(1, 'months');
					};

					// Should the forward and back buttons next to the date be shown?
					$scope.display_forward = dscovrUtil.dateInRange($scope.summary_end_ms);
					$scope.display_back = dscovrUtil.dateInRange($scope.summary_prev_ms);

					break;
				default:
					//if incorrect type parameter, default to:
					$location.url("/vis/summary/7d");
					// replace instead of create new history entry in current digest
					$location.replace();
					$scope.parse_args("7d");
			} //end switch on arg
		};

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
			$scope.parse_args(optional_new_frame_size || $scope.frame_size, optional_new_ms || +$scope.summary_date);
			$cookieStore.put("summary.arg", $scope.frame_size);
			$cookieStore.put("summary.argg", +$scope.summary_date);
			$location.url("/vis/summary/" + $scope.frame_size + "/" + $scope.summary_date.valueOf());
			//change the url ^ but still reparse with the new frame size and date range 
		};

		//formats the summary_frame_info url string to the current user selected date
		$scope.get_plotsrc = function() {
			//console.log( $scope.summary_file_date );
			if ($scope.frame_size) {
				var src = $scope.summary_frame_info[$scope.frame_size].src;
				src = src.split("{{year}}").join( $scope.summary_file_date.format("YYYY") )
				src = src.split("{{month}}").join( $scope.summary_file_date.format("MM") )
				src = src.split("{{day}}").join( $scope.summary_file_date.format("DD") )
				return summary_image_base + src;
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
				return summary_image_base + src;
			};
		};

                // defaults on page load
                $scope.summary_date = dscovrUtil.getMissionEnd().startOf('day').toDate();
		//initialize the page with $routeParams.arg and argg
		if ($routeParams.arg) {
			$scope.parse_args($routeParams.arg, $routeParams.argg);
		} else if ($cookieStore.get("summary.arg")) {
			$scope.parse_args($cookieStore.get("summary.arg"), $cookieStore.get("summary.argg"));
		} else {
                        $scope.locationchange("1d");
                }
		
	});
