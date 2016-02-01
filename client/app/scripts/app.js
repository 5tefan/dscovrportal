'use strict';

/**
 * @ngdoc overview
 * @name dscovrDataApp
 * @description
 * # dscovrDataApp
 *
 * Main module of the application.
 */
angular
  .module('dscovrDataApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
	'ngQuickDate',
  ])
  .config(function ($routeProvider, ngQuickDateDefaultsProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/vis', {
        redirectTo: '/vis/summary'
      })
		//arg is the frame size h6, d1, d3 etc
		//argg is the date selected
      .when('/vis/summary/:arg?/:argg?', {
        templateUrl: 'views/vis/summary.html',
        controller: 'VisSummaryCtrl'
      })
		//arg is start:end
		//argg is prod:param;prod:param;;prod:param etc
      .when('/vis/ts/:arg?/:argg?', {
        templateUrl: 'views/vis/ts.html',
        controller: 'VisTsCtrl'
      })
		//arg is prod:param;prod:param to plot x;y
		//argg is the condition string
      .when('/vis/scatter/:arg?/:argg?', {
        templateUrl: 'views/vis/scatter.html',
        controller: 'VisScatterCtrl'
      })
		//arg is the condition string
      .when('/vis/event/:arg?', {
        templateUrl: 'views/vis/event.html',
        controller: 'VisEventCtrl'
      })
      .when('/download/:arg?/:argg?', {
        templateUrl: 'views/download.html',
        controller: 'DownloadCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

	//Update these when the mission ends
	var mission_start = moment.utc("02-03-2015", "DD-MM-YYYY");
	var mission_end = moment.utc().subtract(1, 'days').startOf('day');
	ngQuickDateDefaultsProvider.set('dateFilter', function(d) {
		return moment(d).isBetween(mission_start, mission_end);
	});
	ngQuickDateDefaultsProvider.set('placeholder', '---------------');
  });
