'use strict';

/**
 * @ngdoc directive
 * @name dscovrDataApp.directive:paramEdit
 * @description
 * # paramEdit
 */
angular.module('dscovrDataApp')
	.directive('paramEdit', function () {
		return {
			template: 
					'<div ng-class="{\'col-xs-11\' : removable, \'col-xs-12\' : !removable}" class="no-padding-left no-padding-right">'+
						'<select class="form-control param-edit-select-prod" ng-model="prod" title={{prodTitle(prod)}}>'+
							'<option value="" disabled selected>-product-</option>'+
							'<option ng-repeat="prod in keys(params)" '+
								'title="{{prodTitle(prod)}}">{{prod}}</option>'+
						'</select>'+
						'<select class="form-control param-edit-select-var" ng-model="param" ng-options="param for param in keys(params[prod])">'+
							'<option value="" disabled selected>-variable-</option>'+
						'</select>'+
					'</div>'+
					'<div class="col-xs-1 no-padding-left no-padding-right" ng-if="removable">'+
						'<a class="btn btn-default" ng-click=rmSelection()><span class="glyphicon glyphicon-remove"></span></a>'+
					'</div>',
			restrict: 'A',
			scope: {
				selection : '=',
				removable : '=',
				rmSelection : "&",
			},
			link: function postLink(scope) {

				var unwatch_params = scope.$watch('$root.params', function() {
					if (scope.$root.params) {
						scope.params = scope.$root.params;
						var unwatch_selection = scope.$watch('selection.predef', function() {
							if (scope.selection && scope.selection.predef) {
								var _ = scope.selection.predef.split(":");
								scope.prod = _[0];
								scope.param = _[1];
								unwatch_selection();
							}
						});
						unwatch_params();
					}
				});

				var unwatch_prods = scope.$watch('$root.prods', function() {
					if (scope.$root.prods) {
						scope.prods = scope.$root.prods;
						unwatch_prods();
					}
				});

				scope.$watchGroup(['prod', 'param'], function() {
					if (scope.param && scope.prod) {
						scope.selection.construct = [
							scope.prod,
							scope.param,
						].join(":");
					} else {
						scope.selection.construct = "";
					}
				});

				//wrapper on Object.keys to be available in scope
				scope.keys = function( obj ) {
					// this gets called a couple time before condition is bound
					// also so validate before attempting to get the keys
					if (obj) {
						return Object.keys(obj);
					}
				};

				scope.prodTitle = function(prod) {
					if (scope.prods) {
						var index = scope.prods.findIndex(function(d) {return d.product===prod;});
						if (index >= 0) {
							return scope.prods[index].title;
						}
					}
				};

			}
		};
	});
