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
					'<div class="col-xs-8">'+
						'<select class="form-control param-edit-select" ng-model="prod" ng-options="prod for prod in keys(params)">'+
							'<option value="" disabled selected>-- product --</option>'+
						'</select>'+
						'<select class="form-control param-edit-select" ng-model="param" ng-options="param for param in keys(params[prod])">'+
							'<option value="" disabled selected>-- parameter --</option>'+
						'</select>'+
					'</div>'+
					'<div class="col-xs-4" ng-if="removable">'+
						'<a class="btn btn-default" ng-click=rmSelection()> - param </a>'+
					'</div>',
			restrict: 'A',
			scope: {
				params : '=',
				selection : '=',
				rmSelection : "&",
			},
			link: function postLink(scope, element, attrs) {

				var unwatch_removable = scope.$watch('removable', function() {
					scope.removable = scope.$eval(attrs.removable);
					unwatch_removable();
				});

				var set_pp_from_selection = function() {
					scope.prod = scope.selection.prod;
					scope.param = scope.selection.param;
				};

				var unwatch_params = scope.$watch('params', function() {
					if (scope.params) {
						if (scope.selection) {
							console.log(scope.selection);
							set_pp_from_selection();
						} else {
							var unwatch_selection = scope.$watch('selection', function() {
								if (scope.selection) {
									set_pp_from_selection();
									unwatch_selection();
								}
							});
						}
						unwatch_params();
					}
				})

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
				}

			}
		};
	});
