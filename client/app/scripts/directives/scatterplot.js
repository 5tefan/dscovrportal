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
				var unwatch = scope.$watch('plot', function() {
					if (scope.plot && scope.plot.data) {
						MG.data_graphic({
							title: scope.plot.title,
							chart_type: 'point',
							data: scope.plot.data,
							x_label: scope.plot.x_label,
							y_label: scope.plot.y_label,
							left: 60, right: 60,
							top: 60, bottom: 60,
							width: element[0].clientWidth,
							height: element[0].clientWidth*0.8,
							target: element[0],
							x_accessor: scope.plot.x_accessor,
							y_accessor: scope.plot.y_accessor,
							color_accessor: "time",
							color_range: ["green", "blue"],
							y_scale_type: scope.plot.y_scale_type,
							x_scale_type: scope.plot.x_scale_type,
							min_y_from_data: true,
						});
						unwatch();
						scope.plot.data = null;
					} //end if scope.plot.data
				});

			}
		};
	});
