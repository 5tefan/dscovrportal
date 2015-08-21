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
		//getting lazy here but arg is arg1
		//argg is arg2, 
		//depending on type, if type is summary
		//arg is the frame size h6, d1, d3 etc
		//and argg is the date selected
		//if type is interactive then arg is
		// start of frame and argg is end of frame
      .when('/vis/summary/:arg?/:argg?', {
        templateUrl: 'views/vis/summary.html',
        controller: 'VisSummaryCtrl'
      })
      .when('/vis', {
        redirectTo: '/vis/summary'
      })
      .when('/vis/event', {
        templateUrl: 'views/vis/event.html',
        controller: 'VisEventCtrl'
      })
      .when('/vis/ts', {
        templateUrl: 'views/vis/ts.html',
        controller: 'VisTsCtrl'
      })
      .when('/vis/scatter', {
        templateUrl: 'views/vis/scatter.html',
        controller: 'VisScatterCtrl'
      })
      .when('/download/:type?/:arg?/:argg?', {
        templateUrl: 'views/download.html',
        controller: 'DownloadCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

	//Update these when the mission ends
	var mission_start = moment.utc("02-03-2015", "DD-MM-YYYY");
	var mission_end = moment.utc("12-13-2015", "DD-MM-YYYY");
	ngQuickDateDefaultsProvider.set('dateFilter', function(d) {
		d = moment(d);
		return d.isAfter(mission_start) && d.isBefore(mission_end);
	});
	ngQuickDateDefaultsProvider.set('placeholder', '---------------');
  });
