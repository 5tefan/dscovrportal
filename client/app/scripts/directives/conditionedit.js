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
					//'<div class="row">' +
					'<div class="no-padding-right col-xs-3">'+
						'<select class="form-control condition-edit-select" ng-model="prod" ng-options="prod for prod in keys(params)">'+
							'<option value="" disabled selected>-product-</option>'+
						'</select>'+
					'</div>'+
					'<div class="no-padding-right no-padding-left col-xs-3">'+
						'<select class="form-control condition-edit-select" ng-model="param" ng-options="param for param in keys(params[prod])">'+
							'<option value="" disabled selected>-variable-</option>'+
						'</select>'+
					'</div>'+
					'<div class="no-padding-right no-padding-left col-xs-2">'+
						'<select class="form-control condition-edit-select" ng-model="relation">'+
							'<option value="gt"> &gt; </option>'+
							'<option value="lt"> &lt; </option>'+
							'<option value="eq"> = </option>'+
							'<option value="ge"> &gt;= </option>'+
							'<option value="le"> &lt;= </option>'+
						'</select>'+
					'</div>'+
					'<div class="no-padding-right no-padding-left col-xs-3">'+
						'<input type="number" class="form-control" placeholder="val" ng-model="value" ng-required>'+
					'</div>'+
					'<div class="col-xs-1 no-padding-right no-padding-left">'+
						'<a class="btn btn-default" ng-click=rmCondition($index)><span class="glyphicon glyphicon-remove"></span></a>'+
					'</div>',
			restrict: 'A',
			scope: {
				condition : '=',
				rmCondition : "&",
			},
			link: function postLink(scope, element, attrs) {

				var unwatch_params = scope.$watch('$root.params', function() {
					if (scope.$root.params) {
						scope.params = scope.$root.params;
						var unwatch_condition = scope.$watch('condition.predef', function() {
							if (scope.condition && scope.condition.predef) {
								var _ = scope.condition.predef.split(":")
								scope.prod = _[0];
								scope.param = _[1];
								scope.relation = _[2];
								scope.value = +_[3];
								unwatch_condition();
							}
						});
						unwatch_params();
					};
				});

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
						return (scope.params[scope.prod] 
							&& (scope.params[scope.prod][scope.param])
							&& (["gt", "lt", "eq", "ge", "le"].indexOf(scope.relation) > -1)
							&& (typeof scope.value === 'number') );
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
