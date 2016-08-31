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
    'ngRoute',
	'ngCookies',
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
      .when('/vis/ts/:arg?/:argg?/:arggg?', {
        templateUrl: 'views/vis/ts.html',
        controller: 'VisTsCtrl'
      })
		//arg is prod:param;prod:param to plot x;y
		//argg is the condition string
      .when('/vis/scatter/:arg?/:argg?/:arggg?', {
        templateUrl: 'views/vis/scatter.html',
        controller: 'VisScatterCtrl'
      })
      .when('/download/:arg?/:argg?', {
        templateUrl: 'views/download.html',
        controller: 'DownloadCtrl'
      })
      .when('/vis/color/ts/:arg?/:argg?/:arggg?', {
        templateUrl: 'views/vis/color/ts.html',
        controller: 'VisColorTsCtrl',
      })
      .otherwise({
        redirectTo: '/'
      });

        var mission_begin = moment("26-07-2016Z", "DD-MM-YYYY").startOf('day').valueOf();
        var mission_end = moment().subtract(1, 'days').endOf('day').valueOf();
	//Update these when the mission ends
	ngQuickDateDefaultsProvider.set('dateFilter', function(d) {
                d = d.valueOf();
                return d >= mission_begin && d <= mission_end;
	});
	ngQuickDateDefaultsProvider.set('placeholder', '---------------');
	ngQuickDateDefaultsProvider.set('closeButtonHtml', 'ok');
	ngQuickDateDefaultsProvider.set('disableClearButton', true);
  });
