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
					'<div class="no-padding-right col-xs-5">'+
						'<select class="form-control condition-edit-select" ng-model="prod" ng-options="prod for prod in keys(params)">'+
							'<option value="" disabled selected>-- product --</option>'+
						'</select>'+
						'<select class="form-control condition-edit-select" ng-model="param" ng-options="param for param in keys(params[prod])">'+
							'<option value="" disabled selected>-- parameter --</option>'+
						'</select>'+
						'<select class="form-control condition-edit-select" ng-model="relation">'+
							'<option value="gt"> &gt; </option>'+
							'<option value="lt"> &lt; </option>'+
							'<option value="eq"> = </option>'+
							'<option value="ge"> &gt;= </option>'+
							'<option value="le"> &lt;= </option>'+
						'</select>'+
					'</div>'+
					'<div class="no-padding-left col-xs-2">'+
						'<form class="form">'+
							'<div class="form-group">'+
								'<input type="number" class="form-control" placeholder="value" ng-model="value" ng-required>'+
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

				var unwatch_removable = scope.$watch('removable', function() {
					scope.removable = scope.$eval(attrs.removable);
					unwatch_removable();
				});

				var set_pprv_from_condition = function() {
					scope.prod = scope.condition.prod
					scope.param = scope.condition.param
					scope.relation = scope.condition.relation
					scope.value = scope.condition.value
				}
					
			
				var unwatch_params = scope.$watch('params', function() {
					if (scope.params) {
						if (scope.condition) {
							set_pprv_from_condition();
						} else {
							var unwatch_condition = scope.$watch('condition', function() {
								if (scope.condition) {
									set_pprv_from_condition();
									unwatch_condition();
								}
							});
						}
						unwatch_params();
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
						return (scope.params[scope.prod] && (typeof scope.value === 'number'));
					} else {
						return false;
					};
				}

				//watch on pprv and update condition construct
				scope.$watchGroup(['prod', 'param', 'relation', 'value'], function() {
					if (scope.isConditionValid()) {
						scope.condition.construct = [
							scope.prod,
							scope.param,
							scope.relation,
							scope.value,
						].join(":");
					} else {
						scope.condition.construct = "";
					}
				})

			}
		};
	});
