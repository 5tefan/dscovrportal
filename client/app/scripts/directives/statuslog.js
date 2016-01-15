'use strict';

/**
 * @ngdoc directive
 * @name dscovrDataApp.directive:statusLog
 * @description
 * # statusLog
 */
angular.module('dscovrDataApp')
	.directive('statusLog', function () {
		return {
			template: '<p style="white-space: pre;" class="status-log-box" >{{text}}</p>',
			restrict: 'A',
			scope: {
				text : '='
			},
			link: function postLink(scope, element, attrs) {
				scope.$watch('text', function(newval) {
					if (newval) {
						// dont do dom manipulation in controllers they say..... 
						// use directives instead
						$(element).children().scrollTop(100000);
						//$(element).children().scrollTop($(element).children()[0].scrollHeight);
						//$(element).scrollTop($(element)[0].scrollHeight);
					}
				});
			}
		};
	});
