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
				'<div class="row">'+
					'<div class="col-xs-4">'+
						'<h3> What to Plot </h3>'+
					'</div>'+
				'</div>'+
				'<div class="row paneEdit">'+
					'<div class="col-xs-1">'+
						'<h5> x-axis: </h5>'+
					'</div>'+
					'<div class="col-xs-6">'+
						'<div param-edit params="params" selection="selection_x" removable="false"></div>'+
					'</div>'+
				'</div>'+
				'<div class="row paneEdit">'+
					'<div class="col-xs-1">'+
						'<h5> y-axis: </h5>'+
					'</div>'+
					'<div class="col-xs-6">'+
						'<div param-edit params="params" selection="selection_y" removable="false"></div>'+
					'</div>'+
				'</div>',
			restrict: 'A',
			scope: {
				params : '=',
				predef : '=',
			},
			link: function postLink(scope, element, attrs) {

				scope.selection_y = {};
				scope.selection_x = {};

				var unwatch_predef = scope.$watch('predef', function() {
					if (scope.predef) {
						var selx = scope.predef[0].split(":");
						var sely = scope.predef[1].split(":");
						scope.selection_x.prod = selx[0];
						scope.selection_x.param = selx[1];
						scope.selection_y.prod = sely[0];
						scope.selection_y.param = sely[1];
						unwatch_predef();
					}
				});

				scope.evalSelections = function() {
					var selection_str = "";
					if (scope.selection_x.construct) {
						selection_str = scope.selection_x.construct + ";";
					}
					if (scope.selection_y.construct) {
						selection_str += scope.selection_y.construct;
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
