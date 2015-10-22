'use strict';

/**
 * @ngdoc directive
 * @name dscovrDataApp.directive:downloadTimeRange
 * @description
 * # downloadTimeRange
 */
angular.module('dscovrDataApp')
	.directive('downloadTimeRange', function () {
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
							'<quick-datepicker ng-model="selected_begin" on-change="onchange()" icon-class="glyphicon glyphicon-calendar"></quick-datepicker>'+
						'</div>'+
						'<div class="col-xs-3">'+
							'<h5> End </h5>'+
							'<quick-datepicker ng-model="selected_end" on-change="onchange()" icon-class="glyphicon glyphicon-calendar"></quick-datepicker>'+
						'</div>'+
					'</div>',
			restrict: 'A',
			scope: {
				predef : '=',
			},
			link: function postLink(scope, element, attrs) {
				scope.selected_begin = moment(1438927200000).toDate();
				scope.selected_end = moment(scope.selected_begin).subtract(70, 'days').toDate();
				//scope.selected_end = moment(1440050400000).toDate();//moment().subtract(2, 'days').toDate();
				//scope.selected_end = moment().subtract(1, 'days').toDate();

				var unwatch_predef = scope.$watch('predef', function() {
					if (scope.predef) {
						scope.selected_begin = new Date(+scope.predef[0]);
						scope.selected_end = new Date(+scope.predef[1]);
						unwatch_predef();
					}
				});

				scope.onchange = function() {
					scope.$emit('datechange', [scope.selected_begin.getTime(), scope.selected_end.getTime()])
				}
				
			}
		};
	});
