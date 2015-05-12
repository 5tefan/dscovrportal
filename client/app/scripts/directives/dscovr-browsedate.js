'use strict';

/**
 * @ngdoc directive
 * @name dscovrDataApp.directive:dscovrBrowsedate
 * @description
 * # dscovrBrowsedate
 */
angular.module('dscovrDataApp')
  .directive('dscovrBrowsedate', function ($window) {
	return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            var moment = $window.moment;

            ngModel.$formatters.push(formatter);
            ngModel.$parsers.push(parser);

            element.on('change', function (e) {
                var element = e.target;
                element.value = formatter(ngModel.$modelValue);
            });

            function parser(value) {
                var m = moment(value);
                var valid = m.isValid();
                ngModel.$setValidity('datetime', valid);
                if (valid) return m;
                else return m;
            }

            function formatter(value) {
                var m = moment(value);
                var valid = m.isValid();
                if (valid) return m.format("YYYY MM DD");
                else return value;

            }

        } //link
    };

  });
