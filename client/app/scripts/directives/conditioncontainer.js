'use strict';

/**
 * @ngdoc directive
 * @name dscovrDataApp.directive:conditionContainer
 * @description
 * # conditionContainer
 */
angular.module('dscovrDataApp')
	.directive('conditionContainer', function ($timeout) {
		return {
			template: 
				'<div class="row" style="margin-top: 20px; margin-bottom: 20px;">'+
					'<div class="col-xs-4">'+
						'<h3> Select Conditions </h3>'+
					'</div>'+
					'<div class="col-xs-2">'+
						'<a class="btn btn-default" ng-click=addCondition()> + add condition </a>'+
					'</div>'+
				'</div>'+
				'<div class="row conditionEdit">'+
					'<div condition-edit params="params" condition="default_condition" removable="false"></div>'+
				'</div>'+
				'<div class="row conditionEdit" ng-repeat="condition in conditions">'+
						'<div condition-edit params="params" condition="condition" removable="true" rm-condition="rmCondition($index)"></div>'+
				'</div>',
			restrict: 'A',
			scope: {
				params : '=',
			},
			link: function postLink(scope, element, attrs) {
				//the default condition that you can't delete
				scope.default_condition = {};
				//arry for any more conditions added with the + button
				scope.conditions = [];
				scope.addCondition = function() {
					var condition = {};
					scope.conditions.push(condition);
				};
				scope.rmCondition = function(i) {
					scope.conditions.splice(i, 1);
				};

				scope.evalConditions = function() {
					var condition_str = "";
					if (scope.default_condition.construct) {
						condition_str = scope.default_condition.construct + ";";
					} 
					for (var each in scope.conditions) {
						if (scope.conditions[each].construct) {
							condition_str += scope.conditions[each].construct + ";";
						}
					}
					return condition_str;
				}

				// listen for evalClikced event, broadcast from parent when
				// when the parent needs the conditions to be evaluated.
				scope.$on('evalConditions', function(e, cb) {
					cb(scope.evalConditions());
				});
			}
		};
	});
