'use strict';

/**
 * @ngdoc directive
 * @name dscovrDataApp.directive:tsParamPane
 * @description
 * # tsParamPane
 */
angular.module('dscovrDataApp')
	.directive('tsParamPane', function () {
		return {
			template: 
				'<div class="row" style="margin-top: 20px; margin-bottom: 20px;">'+
					'<div class="col-xs-4">'+
						'<h3 style="margin: 0; padding: 0;"> Pane {{$index}}</h3>'+
					'</div>'+
					'<div class="col-xs-2">'+
						'<a class="btn btn-default" ng-click=addSelection()> + add parameter </a>'+
					'</div>'+
					'<div class="col-xs-2" ng-if="removable">'+
						'<a class="btn btn-default" ng-click=rmPane()> - remove pane </a>'+
					'</div>'+
				'</div>'+
				'<div class="row paneEdit">'+
					'<div ts-param-edit params="params" selection="default_selection" removable="false"></div>'+
				'</div>'+
				'<div class="row paneEdit" ng-repeat="selection in selections">'+
						'<div ts-param-edit params="params" selection="selection" removable="true" rm-selection="rmSelection($index)"></div>'+
				'</div>',
			restrict: 'A',
			scope: {
				params : '=',
				pane : '=',
				rmPane : '&',
			},
			link: function postLink(scope, element, attrs) {

				scope.$watch('removable', function() {
					scope.removable = scope.$eval(attrs.removable);
				});

				scope.default_selection = {};
				scope.selections = [];
				scope.addSelection = function() {
					var selection = {};
					scope.selections.push(selection);
				};

				scope.rmSelection = function(i) {
					scope.selections.splice(i, 1);
				};

				scope.evalSelections = function() {
					var selection_str = "";
					if (scope.default_selection.construct) {
						selection_str = scope.default_selection.construct + ";";
					}
					for (var each in scope.selections) {
						if (scope.selections[each].construct) {
							selection_str += scope.selections[each].construct + ";";
						}
					}
					return selection_str;
				}

				// listen for evalClikced event, broadcast from parent when
				// when the parent needs the conditions to be evaluated.
				scope.$on('evalSelections', function(e, cb) {
					cb(scope.evalSelections());
				});
			}
		};
	});
