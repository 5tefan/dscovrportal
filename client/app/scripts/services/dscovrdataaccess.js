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
					deferred.reject(response.error + " ("+response.status+") : "+response.message);
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
						deferred.reject("No data found for request");
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
