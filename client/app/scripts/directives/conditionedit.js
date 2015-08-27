'use strict';

/**
 * @ngdoc directive
 * @name dscovrDataApp.directive:conditionEdit
 * @description
 * # conditionEdit
 */
angular.module('dscovrDataApp')
	.directive('conditionEdit', function () {
		return {
			template: 
					'<div class="col-xs-2">'+
						'<select class="form-control" ng-model="condition.prod" ng-options="prod for prod in keys(params)">'+
							'<option value="">-- product --</option>'+
						'</select>'+
					'</div>'+
					'<div class="col-xs-2">'+
						'<select class="form-control" ng-model="condition.param" ng-options="param for param in keys(params[condition.prod])">'+
							'<option value="">-- parameter --</option>'+
						'</select>'+
					'</div>'+
					'<div class="col-xs-2">'+
						'<select class="form-control" ng-model="condition.relation">'+
							'<option value="gt"> &gt; </option>'+
							'<option value="lt"> &lt; </option>'+
							'<option value="eq"> = </option>'+
							'<option value="gte"> &gt;= </option>'+
							'<option value="lte"> &lt;= </option>'+
						'</select>'+
					'</div>'+
					'<div class="col-xs-3">'+
						'<form class="form-inline">'+
							'<div class="form-group">'+
								'<input type="number" class="form-control" placeholder="value" ng-model="condition.value" ng-required>'+
							'</div>'+
						'</form>'+
					'</div>'+
					'<div class="col-xs-2" ng-if="removable">'+
						'<a class="btn btn-default" ng-click=rmCondition($index)> - remove condition </a>'+
					'</div>',
			restrict: 'A',
			scope: {
				params : '=',
				condition : '=',
				rmCondition : "&",
			},
			link: function postLink(scope, element, attrs) {

				scope.$watch('removable', function() {
					scope.removable = scope.$eval(attrs.removable);
				});

				// when this executes, the condition is not yet bound to
				// the scope, so have to watch for when it becomes defined
				var unwatch = scope.$watchCollection('[params, condition]', function(new_val, old_val, scope) {
					if (new_val[0] && new_val[1]) {
						//initialize the values for the select model
						scope.condition.prod = Object.keys(scope.params)[0];
						scope.condition.param = Object.keys(scope.params[scope.condition.prod])[0];
						scope.condition.relation = "gt";
						unwatch();
					}
				})

				// have to listen to selected_prod change to update the initial model
				// value for selected_param
				scope.$watch('condition.prod', function() {
					//validate just in case they select --prod--
					if (scope.condition.prod && scope.params[scope.condition.prod]) {
						scope.condition.param = Object.keys(scope.params[scope.condition.prod])[0];
					}
				})

				//wrapper on Object.keys to be available in scope
				scope.keys = function( obj ) {
					// this gets called a couple time before condition is bound
					// also so validate before attempting to get the keys
					if (obj) {
						return Object.keys(obj);
					}
				}

				scope.isConditionValid = function() {
					if (scope.params && scope.condition) {
						return (scope.params[scope.condition.prod] && (typeof scope.condition.value === 'number'));
					} else {
						return false;
					};
				}

				scope.$watch('condition.value', function() {
					if (scope.isConditionValid()) {
						scope.condition.construct = [
							scope.condition.prod,
							scope.condition.param,
							scope.condition.relation,
							scope.condition.value,
						].join(":");
					} else {
						scope.condition.construct = "";
					}
				})
			}
		};
	});
