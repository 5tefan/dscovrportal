'use strict';

/**
 * @ngdoc directive
 * @name dscovrDataApp.directive:color/conditionContainer
 * @description
 * # color/conditionContainer
 */
angular.module('dscovrDataApp')
	.directive('colorConditionContainer', function () {
		return {
			template: 
				'<div class="row">'+
					'<div class="col-xs-5">'+
						'<h5>Constrain where:</h5>'+
					'</div>'+
					'<div class="col-xs-2">'+
						'<a class="btn btn-default btn-sm" ng-click=addCondition()> + constraint </a>'+
					'</div>'+
				'</div>'+
				'<div class="row condition-edit" ng-repeat="condition in conditions">'+
						'<div color-condition-edit params="params" condition="condition" rm-condition="rmCondition($index)"></div>'+
				'</div>',
			restrict: 'A',
			scope: {
				predef : '=',
			},
			link: function postLink(scope) {
				//array of conditions for ng-repeat
				scope.conditions = [];

				//handle predef conditions
				var unwatch_predef = scope.$watch('predef', function() {
					if (scope.predef) {
						console.log(scope.predef);
						scope.predef.split(';').map( function(condition) {
							scope.conditions.push({predef: condition});
						});
						unwatch_predef();
					}
				});

				scope.addCondition = function() {
					var condition = {};
					scope.conditions.push(condition);
				};
				scope.rmCondition = function(i) {
					if (scope.conditions.length > 0) {
						scope.conditions.splice(i, 1);
					}
				};

				scope.evalConditions = function() {
					var condition_str = "";
					for (var each in scope.conditions) {
						if (scope.conditions[each].construct) {
							condition_str += (condition_str?';':'') + scope.conditions[each].construct;
						} else if (scope.conditions[each].predef) {
							// this is the backup to solve the race condition which occasionally 
							// occurs if the condition edit hasn't bound construct back to this scope
							// so this is a shortcut for predefined conditions
							condition_str += (condition_str?';':'') + scope.conditions[each].predef;
						}
					}
					return condition_str;
				};

				// listen for evalClikced event, broadcast from parent when
				// when the parent needs the conditions to be evaluated.
				scope.$on('evalConditions', function(e, cb) {
					cb(scope.evalConditions());
				});
			}
		};
	});
