'use strict';

/**
 * @ngdoc directive
 * @name dscovrDataApp.directive:tsParamContainer
 * @description
 * # tsParamContainer
 */
angular.module('dscovrDataApp')
	.directive('tsParamContainer', function () {
		return {
			template: 
				'<div class="row ts-param-pane" ng-repeat="pane in panes">'+
					'<div ts-param-pane params="params" pane="pane" rm-pane="rmPane($index)" position="getPosition(pane)"></div>'+
					'<div class="ts-param-pane-remove-pane" class="col-xs-2">'+
						'<a ng-if="panes.length > 1" class="btn btn-default" ng-click=rmPane($index)> - panel </a>'+
					'</div>'+
				'</div>'+
				'<div class="ts-param-pane-add-pane" class="col-xs-2">'+
					'<a class="btn btn-default" ng-click=addPane()> + panel </a>'+
				'</div>',
			restrict: 'A',
			scope: {
				params : '=',
				predef : '=',
			},
			link: function postLink(scope, element, attrs) {
				//for ng-repeat with one element already
				scope.panes = [{}];

				var unwatch_predef = scope.$watch('predef', function() {
					if (scope.predef) {
						scope.panes = []; //remove the default pane if predef panes present
						for (var i in scope.predef) {
							var pane = { predef: scope.predef[i] } 
							scope.panes.push(pane);
						}
						unwatch_predef();
					}
				});
	
				scope.addPane = function() {
					var pane = {};
					scope.panes.push(pane);
				};
				scope.getPosition = function(ofPane) {
					return scope.panes.indexOf(ofPane) + 1;
				};

				scope.rmPane = function(i) {
					scope.panes.splice(i, 1);
				};

				//listener for evalPanes so that we can get
				// how many panes we have up to the scope of the
				// ts plot controller
				scope.$on('evalPanes', function(e, cb) {
					console.log("evalPanes");
					cb(scope.panes.length);
				});

			}
		};
	});
