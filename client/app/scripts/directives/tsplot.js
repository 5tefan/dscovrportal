'use strict';

/**
 * @ngdoc directive
 * @name dscovrDataApp.directive:tsPlot
 * @description
 * # tsPlot
 */
angular.module('dscovrDataApp')
	.directive('tsPlot', function () {
		return {
			template: '',
			restrict: 'A',
			scope: {
				plot : '=',
			},
			link: function postLink(scope, element, attrs) {
				scope.$watch('plot', function() {
					if (scope.plot.data) {
						MG.data_graphic({
							title: scope.plot.title,
							data: scope.plot.data,
							width: element[0].clientWidth,
							height: 400,
							yax_format: d3.format('e'),
							target: element[0],
							x_accessor: 'time',
							y_accessor: scope.plot.y_accessor,
							legend: scope.plot.y_accessor,
							utc_time: true,
							area: false,

						})
					}
				});

			}
		};
	});
