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
			template: 
					'<div class="row">'+
						'<div class="col-xs-3">'+
						'</div>'+
					'</div>',
			restrict: 'A',
			scope: {
				range : '=',
			},
			link: function postLink(scope, element, attrs) {
				console.log("heyyyyyiiiii");

			}
		};
	});
