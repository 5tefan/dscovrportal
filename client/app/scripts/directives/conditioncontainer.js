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
				'<div class="row">'+
					'<div class="col-xs-7">'+
						'<h3> Add constraints </h3>'+
					'</div>'+
					'<div class="col-xs-2">'+
						'<a class="btn btn-default margin-t15" ng-click=addCondition()> + constraint </a>'+
					'</div>'+
				'</div>'+
				'<div class="row condition-edit" ng-repeat="condition in conditions">'+
						'<div condition-edit params="params" condition="condition" removable="true" rm-condition="rmCondition($index)"></div>'+
				'</div>',
			restrict: 'A',
			scope: {
				params : '=',
				predef : '=',
			},
			link: function postLink(scope, element, attrs) {
				//array of conditions for ng-repeat
				scope.conditions = [];

				//handle predef conditions
				var unwatch_predef = scope.$watch('predef', function() {
					if (scope.predef) {
						for (var i in scope.predef) {
							var condition = {
								prod: scope.predef[i][0],
								param: scope.predef[i][1],
								relation: scope.predef[i][2],
								value: Number(scope.predef[i][3]),
							}
							scope.conditions.push(condition);
						}
						unwatch_predef();
					}
				});

				scope.addCondition = function() {
					var condition = {};
					scope.conditions.push(condition);
				};
				scope.rmCondition = function(i) {
					scope.conditions.splice(i, 1);
				};

				scope.evalConditions = function() {
					var condition_str = "";
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
