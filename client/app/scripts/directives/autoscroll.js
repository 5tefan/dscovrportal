'use strict';

/**
 * @ngdoc directive
 * @name dscovrDataApp.directive:autoScroll
 * @description
 * # autoScroll
 */
angular.module('dscovrDataApp')
	.directive('autoScroll', function ($document, $timeout, $location) {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				scope.okSaveScroll = true;

				scope.scrollPos = {};

				$document.bind('scroll', function () {
					if (scope.okSaveScroll) {
					scope.scrollPos[$location.path().split("/")[0]] = $(window).scrollTop();
					}
				});

				scope.scrollClear = function (path) {
					scope.scrollPos[path] = 0;
				};

				scope.$on('$locationChangeSuccess', function (route) {
					$timeout(function () {
						$(window).scrollTop(scope.scrollPos[$location.path().split("/")[0]] ? scope.scrollPos[$location.path().split("/")[0]] : 0);
						scope.okSaveScroll = true;
					}, 0);
				});

				scope.$on('$locationChangeStart', function (event) {
					scope.okSaveScroll = false;
				});
			}
		};
})
