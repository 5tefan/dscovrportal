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
			link: function postLink(scope, element) {
				var unwatch = scope.$watch('plot', function() {
					if (scope.plot && scope.plot.traces) {
						unwatch();
						if (scope.plot.makesquare && scope.plot.layout) {
							scope.plot.layout.width = element[0].clientWidth;
							scope.plot.layout.height = element[0].clientWidth*0.7;
						}
						Plotly.newPlot(element[0], scope.plot.traces, scope.plot.layout || {},  {editable: true, displaylogo: false, showLink: false, modeBarButtonsToRemove: ["sendDataToCloud", "lasso2d"]});
						if (scope.plot.dark) {
							$('.js-plotly-plot .plotly .modebar-btn path').css("fill", "white");
							$('.js-plotly-plot .plotly .modebar').css("background-color", "black");
						}
					}
				});

			}
		};
	});
