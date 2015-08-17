'use strict';

/**
 * @ngdoc directive
 * @name dscovrDataApp.directive:timeRange
 * @description
 * # timeRange
 */
angular.module('dscovrDataApp')
  .directive('timeRange', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the timeRange directive');
      }
    };
  });
