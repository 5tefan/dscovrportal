'use strict';

/**
 * @ngdoc directive
 * @name dscovrDataApp.directive:scatterPlot
 * @description
 * # scatterPlot
 */
angular.module('dscovrDataApp')
	.directive('scatterPlot', function () {
		return {
			template: '',
			restrict: 'A',
			scope: {
				plot : '=',
			},
			link: function postLink(scope, element, attrs) {
				scope.$watch('plot', function() {
					if (scope.plot.data) {
						console.log(scope.plot.data);
						MG.data_graphic({
							title: scope.plot.title,
							chart_type: 'point',
							data: scope.plot.data,
							width: element[0].clientWidth,
							height: 500,
							target: element[0],
							x_accessor: scope.plot.x_accessor,
							y_accessor: scope.plot.y_accessor,
							y_scale_type: scope.plot.y_scale_type,
							x_scale_type: scope.plot.x_scale_type,
						})
					}
				});

			}
		};
	});
