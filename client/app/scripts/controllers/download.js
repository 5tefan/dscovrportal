'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:DownloadCtrl
 * @description
 * # DownloadCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
  .controller('DownloadCtrl', function ($scope, $routeParams, $cookieStore, $location, $http) {

	$scope.mission_start = moment.utc("02-03-2015", "DD-MM-YYYY");
	$scope.mission_end = moment.utc("12-12-2015", "DD-MM-YYYY");
	var mission_range = moment.range($scope.mission_start, $scope.mission_end);
	var file_catalog = "http://gis.ngdc.noaa.gov/dscovr-file-catalog/files";

$scope.testData = {
    "20150401": {
        "att": "http://www.ngdc.noaa.gov/dscovr/files/2015/04/it_vc0_dscovr_s20150401000000_e20150401235959_p20150402000010_pub.nc.gz"
    },
    "20150402": {
        "att": "http://www.ngdc.noaa.gov/dscovr/files/2015/04/it_vc1_dscovr_s20150402000000_e20150402235959_p20150403000010_pub.nc.gz",
        "f1m": "http://www.ngdc.noaa.gov/dscovr/files/2015/04/it_vc0_dscovr_s20150402000000_e20150402235959_p20150403000010_pub.nc.gz"
    },
    "20150403": {
        "att": "http://www.ngdc.noaa.gov/dscovr/files/2015/04/it_vc0_dscovr_s20150403000000_e20150403235959_p20150404000059_pub.nc.gz",
        "f1m": "http://www.ngdc.noaa.gov/dscovr/files/2015/04/it_vc1_dscovr_s20150403000000_e20150403235959_p20150404000059_pub.nc.gz"
    }
}


	//info icon to do desc
	$scope.download_data_type = [
		{type: "mg1", selected: true, desc: "Magnetometer L1 data full res"},
		{type: "fc1", selected: true, desc: "Faraday Cup L1 data "},
		{type: "m1s", selected: true, desc: "Magnetometer 1 second"},
		{type: "f3s", selected: true, desc: "Faraday Cup 3 second"},
		{type: "m1m", selected: true, desc: "Magnetometer 1 minute average"},
		{type: "f1m", selected: true, desc: "Faraday Cup 1 minute average"},
		{type: "pop", selected: true, desc: "Predicted Orbit Product"},
		{type: "mgc", selected: true, desc: "Magnetometer Calibration"},
		{type: "fcc", selected: true, desc: "Faraday Cup Calibration"},
		{type: "att", selected: true, desc: "Spacecraft Attitude"},
		{type: "vc0", selected: true, desc: "Spacecraft Attitude"},
		{type: "vc1", selected: true, desc: "Spacecraft Attitude"},
	];

	//optimized instead of having to search download data type`
	$scope.download_data_type_lookaside = {
		mg1 : 0,
		fc1 : 1,
		m1s : 2, 
		f3s : 3,
		m1m : 4,
		f1m : 5,
		pop : 6,
		mgc : 7,
		fcc : 8,
		att : 9,
		vc0 : 10,
		vc1 : 11
	}

	$scope.download_dayfile_info = {
			typea: "/dscovr_data/typea/{{year}}/{{month}}/{{year}}{{month}}{{day}}-day.nc",
			typeb: "/dscovr_data/typeb/{{year}}/{{month}}/{{year}}{{month}}{{day}}-day.nc",
			typec: "/dscovr_data/typec/{{year}}/{{month}}/{{year}}{{month}}{{day}}-day.nc",
			typed: "/dscovr_data/typed/{{year}}/{{month}}/{{year}}{{month}}{{day}}-day.nc",
			typee: "/dscovr_data/typee/{{year}}/{{month}}/{{year}}{{month}}{{day}}-day.nc",
	};

	//these are wrapper functions for converting to and from url parameters
	//useful so that you only have to change these two values if we need to
	//change the resolution avaialable in the parameter space. Perhaps also 
	//may be needed for the dynamic plotting, variable resolution depending on 
	//the type of visualization
	$scope.make_urldate = function(dadate) {
		return moment.utc(dadate).startOf('day').toDate().getTime()/100000;
	}
	$scope.parse_urldate = function(danumberz) {
		return moment.utc(danumberz * 100000);
	}
	$scope.make_filedates = function() {
		if ($scope.selected_start_date && $scope.selected_end_date) {
			var sel_start = moment($scope.selected_start_date);
			var sel_end = moment($scope.selected_end_date);
			if (mission_range.contains(sel_start) && mission_range.contains(sel_end) ) {
				if (sel_start.isBefore(sel_end) ) {
					$scope.error_message = "";

					//http request, should break out into a service maybe?
					$http.get(file_catalog, { params: { start_date: sel_start.format(), end_date: sel_end.format() } } )
						.success( function(data, status) {
							$scope.files = data;
						})

				} else {
					$scope.error_message = "Make sure end date is after start date";
				}
			} else {
				$scope.error_message = "Begin and/or end date is not during mission";
			}
		}
	}

	//make wget function to create the wget command and bind to the input box
	$scope.make_wget = function() {
		if ($scope.files) {
			var to_return = [];
			to_return.push("wget");
			for (var each in $scope.files) {
				for (var link_type in $scope.files[each]) {
					var index = $scope.download_data_type_lookaside[ link_type ];
					//console.log("i: " + index + ", v:" + link_type);
					if (index && $scope.download_data_type[ index ].selected == true) {
						to_return.push( $scope.files[ each ][ link_type ] );
					}
				}
				/* old way, optimized above
				for (var type in $scope.download_data_type) {
					if ($scope.download_data_type[type].selected == true) {
						if ($scope.files[ each ][ $scope.download_data_type[type].type ] ) {
							to_return.push( $scope.files[ each ][ $scope.download_data_type[type].type ]);
						}
					}
				}
				*/
			}
			return to_return.join(" ");
		}
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

	if ($routeParams.type == "tape") {
		$scope.selectmode = 1; //1 is for dynamic plot
		//todo: parse the frame for browse type plot
	} else if ($routeParams.type == "file") {
		$scope.selectmode = 0; //0 for summaries

		$scope.start_date = moment.utc().subtract(2, 'days').startOf('day');
		if ( $routeParams.arg && mission_range.contains( $scope.parse_urldate($routeParams.arg) ) ) {
			$scope.start_date = $scope.parse_urldate($routeParams.arg);
		}

		$scope.end_date = moment($scope.start_date).add(1, 'days');
		if ( $routeParams.argg && mission_range.contains( $scope.parse_urldate($routeParams.argg) ) ){
			$scope.end_date = $scope.parse_urldate($routeParams.argg);
		} else {
			//if there is no end date specified, automatically make
			//it one day and fill it in.
			//TODO: later put in context memory to fill this date from the other
			//tab? Would this add any value? I actually think it might not
			//because either they are pasting url and should have both, they 
			//should never end up with only arg and no argg
			$location.url(
				"/download/file/" 
				+ $scope.make_urldate($scope.start_date)
				+ "/" + $scope.make_urldate( $scope.end_date ));
			return;
		}

		$scope.selected_start_date = $scope.start_date.format("YYYY-MM-DD");
		$scope.selected_end_date = $scope.end_date.format("YYYY-MM-DD");
		$scope.make_filedates();
	} else {
		$location.url("/download/file");
		return;
	}

	$scope.dateselect_start_onchange = function() {
		if ($scope.datepicker_start_opened == true) {
			$scope.dateselect_start_locationchange();
		}
	}
	$scope.dateselect_start_locationchange = function() {
		$location.url(
			"/download/file/" 
			+ $scope.make_urldate($scope.selected_start_date)
			+ "/" + $scope.make_urldate( $scope.selected_end_date ));
	}
	$scope.datepicker_start_open = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.datepicker_start_opened = true;
	};
	$scope.dateselect_end_onchange = function() {
		if ($scope.datepicker_end_opened == true) {
			$scope.dateselect_end_locationchange();
		}
	}
	$scope.dateselect_end_locationchange = function() {
		$location.url(
			"/download/file/" 
			+ $scope.make_urldate($scope.selected_start_date)
			 + "/" + $scope.make_urldate( $scope.selected_end_date ));
	}
	$scope.datepicker_end_open = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.datepicker_end_opened = true;
	};

	//formats the summary_frame_info url string to the current user
	//selected date
	$scope.format_srcdate = function(src, date) {
		src = src.split("{{year}}").join( date.format("YYYY") )
		src = src.split("{{month}}").join( date.format("MM") )
		src = src.split("{{day}}").join( date.format("DD") )
		return src;
	}

	$('data-type-name').tooltip();

});


