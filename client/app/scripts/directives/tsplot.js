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
				var unwatch = scope.$watch('plot', function() {
					if (scope.plot && scope.plot.data) {
						MG.data_graphic({
							title: scope.plot.title,
							data: scope.plot.data,
							width: element[0].clientWidth,
							height: 400,
							right: 100,
							left: 90,
							yax_format: d3.format('e'),
							target: element[0],
							x_accessor: 'time',
							y_accessor: scope.plot.y_accessor,
							legend: scope.plot.y_accessor,
							utc_time: true,
							area: false,
							y_scale_type: scope.plot.y_scale_type,
							y_label: scope.plot.y_label,
							xax_count: 10,
							yax_count: 5,
							x_extended_ticks: true,
							y_extended_ticks: true,
							min_y_from_data: true,
							utc_time: true,
							x_rollover_format: function(d) {
return d.time.toUTCString() + " - ";
							},
						})
						unwatch();
						scope.plot.data = null;
					} //end if scope.plot.data
				});

			}
		};
	});
