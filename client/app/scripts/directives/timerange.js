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
				construct : '=',
				predef : '=',
			},
			link: function postLink(scope, element, attrs) {
				scope.selected_begin = moment(1438927200000).toDate();
				scope.selected_end = moment(1440050400000).toDate();//moment().subtract(2, 'days').toDate();
				//scope.selected_end = moment().subtract(1, 'days').toDate();

				var unwatch_predef = scope.$watch('predef', function() {
					if (scope.predef) {
						scope.selected_begin = new Date(+scope.predef[0]);
						scope.selected_end = new Date(+scope.predef[1]);
						scope.onchange();
						unwatch_predef();
					}
				});

				scope.construct = "";
				scope.construct += "m1m:time:ge:" + scope.selected_begin.getTime() + ";";
				scope.construct += "m1m:time:le:" + scope.selected_end.getTime();
				

				scope.onchange = function() {
					scope.construct = "";
					scope.construct += "m1m:time:ge:" + scope.selected_begin.getTime() + ";";
					scope.construct += "m1m:time:le:" + scope.selected_end.getTime();
				}
				
			}
		};
	});
