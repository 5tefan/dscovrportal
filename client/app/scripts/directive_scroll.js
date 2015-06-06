'use strict';

/**
 * @ngdoc function
 * @name dscovrDataApp.directive:scroll-directive
 * @description
 * # MainCtrl
 * Controller of the dscovrDataApp
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
                    scope.scrollPos[$location.path()] = $(window).scrollTop();
                }
            });

            scope.scrollClear = function (path) {
                scope.scrollPos[path] = 0;
            };

            scope.$on('$locationChangeSuccess', function (route) {
                $timeout(function () {
                    $(window).scrollTop(scope.scrollPos[$location.path()] ? scope.scrollPos[$location.path()] : 0);
                    scope.okSaveScroll = true;
                }, 0);
            });

            scope.$on('$locationChangeStart', function (event) {
                scope.okSaveScroll = false;
            });
        }
    };
})
