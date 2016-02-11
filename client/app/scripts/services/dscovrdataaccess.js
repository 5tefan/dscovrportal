'use strict';

/**
 * @ngdoc service
 * @name dscovrDataApp.dscovrDataAccess
 * @description
 * # dscovrDataAccess
 * Factory in the dscovrDataApp.
 */
angular.module('dscovrDataApp')
  .factory('dscovrDataAccess', function ($http, $q, $timeout) {
    // Service logic
	var _url_base = "//gis.ngdc.noaa.gov/dscovr-data-access/";
	var _commonGet = function( url ) {
		console.log(url);
		var tries_counter = 0;
		var deferred = $q.defer();
		function do_request() {
			$http.get( url ).success( function( response ) {
				deferred.resolve(response);
			}).error( function( response ) {
				if (tries_counter < 3) {
					tries_counter++;
					$timeout(do_request, 500);
				} else {
					if (response) {
						deferred.reject(response.error + " ("+response.status+") : "+response.message);
					} else {
						deferred.reject("could not contact data server, please try again later");
					};
				};
			});
		};
		do_request();
		return deferred.promise;
	}

    // Public API here
	return {
		getProducts: function() {
			return $http.get( _url_base + 'products').then( function(response) {
				if (typeof response.data === 'object') {
					return response.data;
				} else {
					return $q.reject(response.data);
				}
			}, function(response) {
				return $q.reject(response.data);
			});
		},
		getProducts2: function() {
			var url = _url_base + 'products';
			return _commonGet(url);
		},
		getParameters: function() {
			return $http.get( _url_base + 'parameters').then( function(response) {
				if (typeof response.data === 'object') {
					return response.data;
				} else {
					return $q.reject(response.data);
				}
			}, function(response) {
				return $q.reject(response.data);
			});
		},
		getParameters2: function() {
			var url = _url_base + 'parameters';
			return _commonGet(url);
		},
		getValues: function(parameters, criteria) {
			var url = _url_base + 'values?parameters=' + parameters + '&criteria=' + criteria;
			console.log(url);
			return $http.get( url ).then( function(response) {
				if (typeof response.data === 'object') {
					return response.data;
				} else {
					return $q.reject(response.data);
				}
			}, function(response) {
				return $q.reject(response.data);
			});
		},
		getValues2: function(parameters, criteria) {
			var url = _url_base + 'values?parameters=' + parameters + '&criteria=' + criteria;
			console.log(url);
			var tries_counter = 0;
			var deferred = $q.defer();
			function do_request() {
				$http.get( url ).success( function( response ) {
					if ( response.length < 1 ) {
						deferred.reject("no data matching request");
					} else {
						deferred.resolve(response);
					}
				} ).error( function( response ) {
					if (tries_counter < 3) {
						tries_counter++;
						do_request();
					} else {
						deferred.reject(response.error + " ("+response.status+") : "+response.message);
					}
				});
			}
			do_request();
			return deferred.promise;
		},
		getValues3: function(parameters, timerange, criteria) {
			// extra parameter for timerange because it really is a detail relevant to this api
			// for how to specify the time... ie that it needs to be m1m:time. So I'm pulling 
			// that logic out of the ctrlrs and instread implementing it here. Now ctrlrs are 
			// naive and only know how to specify the time range as an array of numbers start and end
			var timecriteria = "m1m:time:ge:" + timerange[0] + ";m1m:time:le:" + timerange[1] + ";";
			var url = _url_base + 'values?parameters=' + parameters + '&criteria=' + timecriteria + criteria;
			console.log(url);
			var tries_counter = 0;
			var deferred = $q.defer();
			function do_request() {
				$http.get( url ).success( function( response ) {
					if ( response.length < 1 ) {
						deferred.reject("no data matching request");
					} else {
						deferred.resolve(response);
					}
				} ).error( function( response ) {
					if (tries_counter < 3) {
						tries_counter++;
						do_request();
					} else {
						if (response) {
							deferred.reject(response.error + " ("+response.status+") : "+response.message);
						} else {
							deferred.reject("could not contact data server, please try again later");
						};
					}
				});
			}
			do_request();
			return deferred.promise;
		},
		getFiles: function(start, end) {
			var url = _url_base + 'files?start_date=' + start + '&end_date=' + end;
			return $http.get( url ).then( function(response) {
				if (typeof response.data === 'object') {
					return response.data;
				} else {
					return $q.reject(response.data);
				}
			}, function(response) {
				return $q.reject(response.data);
			});
		},
		getFiles2: function(start, end) {
			var url = _url_base + 'files?start_date=' + start + '&end_date=' + end;
			return _commonGet(url);
		}
	};
});
