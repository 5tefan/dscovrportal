'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:DownloadCtrl
 * @description
 * # DownloadCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
  .controller('DownloadCtrl', function ($scope, $routeParams, $cookieStore, $location, dscovrDataAccess) {

	//info icon to do desc
	dscovrDataAccess.getProducts().then( function(products) {
		if ($routeParams.argg) {
			//if argg specified, then only select ones that are
			// specified
			var selected = $routeParams.argg.split(';');
			$scope.products = products.map(function(d) {
				 if (selected.indexOf(d.product) > -1) {
					d.selected = true;
				}
				return d;
			});
		} else {
			//setting selected to true so that all checkboxes are marked on page load
			$scope.products = products.map(function(d) { d.selected = true; return d;} );
		}
	});

	if ($routeParams.arg) {
		var daterange = $routeParams.arg.split(';');
		if (daterange.length == 2 && !isNaN(daterange[0]) && !isNaN(daterange[1])) {
			dscovrDataAccess.getFiles(daterange[0], daterange[1]).then( function(data) {
				$scope.files = data;
			});
			$scope.predef_time = daterange;
		}
	}
	//make wget function to create the wget command and bind to the input box
	$scope.make_wget = function() {
		if ($scope.files) {
			var selected = [];
			for (var each in $scope.products) {
				if ($scope.products[each].selected) {
					selected.push($scope.products[each].product);
				}
			}
			var to_return = [];
			to_return.push("wget");
			for (var each in $scope.files) {
				for (var product in selected) {
					to_return.push( $scope.files[each][selected[product]] );
				}
			}
			return to_return.join(" ");
		}
	}

	$scope.$on("datechange", function(event, dates) {
		var selected = [];
		for (var each in $scope.products) {
			if ($scope.products[each].selected) {
				selected.push($scope.products[each].product);
			}
		}
		console.log(dates);
		$location.url("/download/" 
			+ dates.join(';') + '/'
			+ selected.join(';') );
	});
});


