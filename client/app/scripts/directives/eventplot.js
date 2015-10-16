'use strict';

/**
 * @ngdoc directive
 * @name dscovrDataApp.directive:eventPlot
 * @description
 * # eventPlot
 */
angular.module('dscovrDataApp')
	.directive('eventPlot', function () {
		return {
			template: '',
			restrict: 'A',
			scope: {
				plot : '=',
			},
			link: function postLink(scope, element, attrs) {
				scope.$watch('plot', function() {
					if (scope.plot.data) {
						scope.plot.data.map(function(d) {
							d.time = new Date(+d.time);
							d.val = 1;
							return d;
						});
						MG.data_graphic({
							title: scope.plot.title,
							chart_type: 'point',
							data: scope.plot.data,
							width: element[0].clientWidth,
							height: 100,
							target: element[0],
							x_accessor: 'time',
							y_accessor: 'val',
						})
					}
				});

			}
		};
	});
