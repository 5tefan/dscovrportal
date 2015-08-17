'use strict';

/**
 * @ngdoc directive
 * @name dscovrDataApp.directive:tsParamContainer
 * @description
 * # tsParamContainer
 */
angular.module('dscovrDataApp')
  .directive('tsParamContainer', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the tsParamContainer directive');
      }
    };
  });
