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
	'ui.bootstrap'
  ])
  .config(function ($routeProvider) {
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
      .when('/vis/advanced/:arg?/:argg?/:arggg?', {
        templateUrl: 'views/vis/advanced.html',
        controller: 'VisAdvancedCtrl'
      })
      .when('/vis', {
        redirectTo: '/vis/summary'
      })
      .when('/download/:type?/:arg?/:argg?', {
        templateUrl: 'views/download.html',
        controller: 'DownloadCtrl'
      })
      .when('/vis/event', {
        templateUrl: 'views/vis/event.html',
        controller: 'VisEventCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
