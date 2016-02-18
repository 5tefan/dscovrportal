'use strict';

/**
 * @ngdoc directive
 * @name dscovrDataApp.directive:tooltipHelp
 * @description
 * # tooltipHelp
 */
angular.module('dscovrDataApp')
	.directive('tooltipHelp', function () {
		return {
			template: '<span data-toggle="tooltip" class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>',
			restrict: 'A',
			scope: {},
			link: function postLink(scope, element, attrs) {
				$(element[0].firstChild).tooltip({
					title: attrs.hover,
					placement: attrs.placement || 'left',
					html: true,
				});
			}
		};
	});
