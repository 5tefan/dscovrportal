'use strict';

/**
 * @ngdoc directive
 * @name dscovrDataApp.directive:plotlyPlot
 * @description
 * # plotlyPlot
 */
angular.module('dscovrDataApp')
	.directive('plotlyPlot', function () {
		return {
			template: '',
			restrict: 'A',
			scope: {
				plot : '=',
			},
			link: function postLink(scope, element, attrs) {
				var unwatch = scope.$watch('plot', function() {
					if (scope.plot && scope.plot.traces) {
						unwatch();
						Plotly.newPlot(element[0], scope.plot.traces, scope.plot.layout || {}
						,  {displaylogo: false, showLink: false, modeBarButtonsToRemove: ["sendDataToCloud", "lasso2d"]});
					}
				});

			}
		};
	});
