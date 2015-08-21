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
						'<div class="col-xs-4">'+
							'<h3> Select Date Range </h3>'+
						'</div>'+
					'</div>'+
					'<div class="row" style="margin-bottom: 15px">'+
						'<div class="col-xs-3">'+
							'<h5> Begin </h5>'+
							'<quick-datepicker ng-model="selected_begin" on-change="begin_onchange()" icon-class="glyphicon glyphicon-calendar" timezone="UTC"></quick-datepicker>'+
						'</div>'+
						'<div class="col-xs-3">'+
							'<h5> End </h5>'+
							'<quick-datepicker ng-model="selected_end" on-change="end_onchange()" icon-class="glyphicon glyphicon-calendar" timezone="UTC"></quick-datepicker>'+
						'</div>'+
					'</div>',
			restrict: 'A',
			scope: {
				construct : '=',
			},
			link: function postLink(scope, element, attrs) {
				scope.selected_begin = moment().subtract(2, 'days').toDate();
				scope.selected_end = moment().subtract(1, 'days').toDate();
				scope.construct = "";
				scope.construct += "m1m:time:le:" + scope.selected_begin.getTime() + ";";
				scope.construct += "m1m:time:ge:" + scope.selected_end.getTime();
				

				scope.onchange = function() {
					scope.construct = "";
					scope.construct += "m1m:time:le:" + scope.selected_begin.getTime() + ";";
					scope.construct += "m1m:time:ge:" + scope.selected_end.getTime();
				}
				
			}
		};
	});
