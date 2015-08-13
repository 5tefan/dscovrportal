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
						'<h2 style="margin: 0; padding: 0;"> Select Conditions </h2>'+
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
				'</div>'+
				'<div class="row">'+
					'<div class="col-xs-2">'+
						'<a class="btn btn-default" role="button" ng-click="evalConditions()"> Search </a>'+
					'</div>'+
					'<div class="col-xs-5">'+
						'<p> {{ error }} </p>'+
					'</div>'+
				'</div>',
			restrict: 'A',
			scope: {
				params : '=',
				where: '='
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
				}
				scope.evalConditions = function() {
					var where;
					if (scope.default_condition.construct) {
						where = scope.default_condition.construct + ";";
					} 
					for (var each in scope.conditions) {
						if (scope.conditions[each].construct) {
							where += scope.conditions[each].construct + ";";
						}
					}
					if (where) {
						console.log(where); //TODO replace with request
					} else {
						// flash an error message if none of the conditions are valid
						scope.error = "please enter at least 1 valid condition!";
						$timeout(function() {
							scope.error = "";
						}, 5000);
					}
				}
			}
		};
	});
