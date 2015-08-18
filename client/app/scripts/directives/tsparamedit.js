'use strict';

/**
 * @ngdoc directive
 * @name dscovrDataApp.directive:tsParamEdit
 * @description
 * # tsParamEdit
 */
angular.module('dscovrDataApp')
	.directive('tsParamEdit', function () {
		return {
			template: 
					'<div class="col-xs-2">'+
						'<select class="form-control" ng-model="selection.prod" ng-options="prod for prod in keys(params)">'+
							'<option value="">-- product --</option>'+
						'</select>'+
					'</div>'+
					'<div class="col-xs-2">'+
						'<select class="form-control" ng-model="selection.param" ng-options="param for param in keys(params[selection.prod])">'+
							'<option value="">-- parameter --</option>'+
						'</select>'+
					'</div>'+
					'<div class="col-xs-2 col-xs-offset-2" ng-if="removable">'+
						'<a class="btn btn-default" ng-click=rmSelection()> - remove parameter </a>'+
					'</div>',
			restrict: 'A',
			scope: {
				params : '=',
				selection : '=',
				rmSelection : "&",
			},
			link: function postLink(scope, element, attrs) {

				scope.$watch('removable', function() {
					scope.removable = scope.$eval(attrs.removable);
				});

				// when this executes, the selection is not yet bound to
				// the scope, so have to watch for when it becomes defined
				var unwatch = scope.$watchCollection('[params, selection]', function(new_val, old_val, scope) {
					if (new_val[0] && new_val[1]) {
						//initialize the values for the select model
						scope.selection.prod = Object.keys(scope.params)[0];
						scope.selection.param = Object.keys(scope.params[scope.selection.prod])[0];
						unwatch();
					}
				})

				// have to listen to selected_prod change to update the initial model
				// value for selected_param
				scope.$watch('selection.prod', function() {
					//validate just in case they select --prod--
					if (scope.selection.prod && scope.params[scope.selection.prod]) {
						scope.selection.param = Object.keys(scope.params[scope.selection.prod])[0];
					}
				});
				// watch the selection.param and selection.prod which are the model for the
				// drop down selection. Update selection.construct based on what the user selects
				scope.$watchGroup(['selection.param', 'selection.prod'], function() {
					if (scope.selection.param && scope.selection.prod) {
						scope.selection.construct = [
							scope.selection.prod,
							scope.selection.param,
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
