'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.controller:DownloadCtrl
 * @description
 * # DownloadCtrl
 * Controller of the dscovrDataApp
 */
angular.module('dscovrDataApp')
  .controller('DownloadCtrl', function ($scope, $routeParams, $cookieStore, $location, $route, dscovrDataAccess) {

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

	$scope.parse_arg = function(arg) {
		// arg expected to be a string of two ms since 1970 concatenated by a ;
		// eg "1438754400000;1439791200000". This is broken into a separate function
		// because with $locationChangeSuccess events intercepted, $routeParams are not
		// updated so just call this function with the updated routeParams on locationchange
		if (arg) {
			var daterange = arg.split(';');
			if (daterange.length == 2 && !isNaN(daterange[0]) && !isNaN(daterange[1])) {
				dscovrDataAccess.getFiles(daterange[0], daterange[1]).then( function(data) {
					$scope.files = data;
				});
				$scope.predef_time = daterange;
			}
		}
	};

	$scope.get_selected_products = function() {
		// go through the products and create a list out of the 
		// ones that are checked (true)
		var selected = [];
		for (var each in $scope.products) {
			if ($scope.products[each].selected) {
				selected.push($scope.products[each].product);
			}
		}
		return selected;
	};

	//make wget function to create the wget command and bind to the input box
	$scope.make_wget = function() {
		if ($scope.files) {
			var selected = $scope.get_selected_products();
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

	// see http://stackoverflow.com/a/14329570
	// prevents refresh on route change
	var lastRoute = $route.current;
	$scope.$on('$locationChangeSuccess', function(event) {
		if ($route.current.$$route.controller == 'DownloadCtrl') {
			$route.current = lastRoute;
		};
	});

	$scope.selected_products_onchange = function() {
		// when the selected products change, update the url
		// use $scope.predef_time to get the time since that should
		// stay update by $scope.parse_arg, also use $location.replace
		// since we don't want a history entry every time they change
		// the selected products
		// added if $scope.products so that location doesn't get changed

		if ($scope.products) {
			var selected = $scope.get_selected_products();
			$location.url("/download/" 
				+ $scope.predef_time.join(';') + '/' + selected.join(';')
			);
			$location.replace();
		};
	};

	$scope.$on("datechange", function(event, dates) {
		if ($scope.products) {
			var selected = $scope.get_selected_products();
			$location.url("/download/" 
				+ dates.join(';') + '/' + selected.join(';')
			);
			$scope.parse_arg(dates.join(";"));
		}
	});

	// initialize by parsing routeparam arg
	$scope.parse_arg($routeParams.arg);
});


