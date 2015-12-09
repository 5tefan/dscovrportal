'use strict';

/**
 * @ngdoc service
 * @name dscovrDataApp.dscovrDataAccess
 * @description
 * # dscovrDataAccess
 * Factory in the dscovrDataApp.
 */
angular.module('dscovrDataApp')
  .factory('dscovrDataAccess', function ($http, $q) {
    // Service logic
	var _url_base = "//gis.ngdc.noaa.gov/dscovr-data-access/";
	

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
			var deferred = $q.defer();
			$http.get( url ).success( function( response ) {
				if ( response.length < 1 ) {
					deferred.reject("No data found for request");
				} else {
					deferred.resolve(response);
				}
			} ).error( function( response ) {
					deferred.reject("Error " + response.status + " ("+response.error+") : " + response.message);
			});
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
		}
	};
});
