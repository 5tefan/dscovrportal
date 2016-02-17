'use strict';

/**
 * @ngdoc directive
 * @name dscovrDataApp.directive:scatterParamPane
 * @description
 * # scatterParamPane
 */
angular.module('dscovrDataApp')
	.directive('scatterParamPane', function () {
		return {
			template: 
				'<div class="row paneEdit">'+
					'<div class="col-xs-3 no-padding-right">'+
						'<h4> x-axis: </h4>'+
					'</div>'+
					'<div class="col-xs-9 no-padding-left no-padding-right">'+
						'<div param-edit selection="selection_x" removable="false"></div>'+
					'</div>'+
					'<form class="col-xs-5 col-xs-offset-3 clear">'+
						'<div class="checkbox">'+
							'<label><input type="checkbox" ng-model="selection_x.log">Log x scale</label>'+
						'</div>'+
					'</form>'+
				'</div>'+
				'<div class="row paneEdit">'+
					'<div class="col-xs-3 no-padding-right">'+
						'<h4> y-axis: </h4>'+
					'</div>'+
					'<div class="col-xs-9 no-padding-left no-padding-right">'+
						'<div param-edit selection="selection_y" removable="false"></div>'+
					
					'</div>'+
					'<form class="col-xs-5 col-xs-offset-3 clear">'+
						'<div class="checkbox">'+
							'<label><input type="checkbox" ng-model="selection_y.log">Log y scale</label>'+
						'</div>'+
					'</form>'+
				'</div>',
			restrict: 'A',
			scope: {
				predef : '=',
			},
			link: function postLink(scope, element, attrs) {

				scope.selection_y = {};
				scope.selection_x = {};

				var unwatch_predef = scope.$watch('predef', function() {
					if (scope.predef) {
						var _ = scope.predef.split(";");
						if (_[0]) {
							var selsplitlog = _[0].split("*");
							scope.selection_x.log = (selsplitlog[1] == 'log');
							scope.selection_x.predef = selsplitlog[0];
						};
						if (_[1]) {
							var selsplitlog = _[1].split("*");
							scope.selection_y.log = (selsplitlog[1] == 'log');
							scope.selection_y.predef = selsplitlog[0];
						};
						unwatch_predef();
					}
				});

				scope.getOrCreateConstruct = function(selection) {
					// solution to the race condition, grab the actual prod and 
					// param from the selection if the construct isn't there yet
					if (selection.construct) {
						return selection.construct + (selection.log?'*log':'');
					} else if (selection.prod && selection.param) {
						return selection.prod + ":" + selection.param + (selection.log?'*log':'');
					}; // else 
					return "";
				};

				scope.evalParameters = function() {
					var sel_x = scope.getOrCreateConstruct(scope.selection_x);
					var sel_y = scope.getOrCreateConstruct(scope.selection_y);
					// for scatter plots, enforce that they are both there
					if (sel_x && sel_y) {
						return [sel_x, sel_y].join(';');
					} else { '' };
				}

				// listen for evalParameters event, broadcast from parent when
				// when the parent needs the conditions to be evaluated.
				scope.$on('evalParameters', function(e, cb) {
					cb(scope.evalParameters());
				});
			}
		};
	});
