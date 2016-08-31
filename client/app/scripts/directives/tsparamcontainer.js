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
					'<div ts-param-pane pane="pane" removable="panes.length > 1" rm-pane="rmPane($index)" position="$index+1"></div>'+
				'</div>'+
				'<div class="ts-param-pane-add-pane" class="col-xs-2">'+
					'<a class="btn btn-default" ng-click=addPane()> + panel </a>'+
				'</div>',
			restrict: 'A',
			scope: {
				predef : '=',
			},
			link: function postLink(scope) {
				//for ng-repeat with one element already
				scope.panes = [{}];

				var unwatch_predef = scope.$watch('predef', function() {
					if (scope.predef) {
						// remove the default pane and puts in the predefined ones
						scope.panes = scope.predef.split(";;").map( function(pane) {
                                                     return {predef: pane};
                                                });
						unwatch_predef();
					}
				});

				// add one empty pane on click + panel button
				scope.addPane = function() {
					// push an empty pane with no predef
					scope.panes.push({});
				};

				// remove one panel on X button in panel
				scope.rmPane = function(i) {
					if (scope.panes.length > 1) {
						scope.panes.splice(i, 1);
					}
				};

				//listener for evalPanes so that we can get
				// how many panes we have up to the scope of the
				// ts plot controller
				scope.$on('evalNumPanes', function(e, cb) {
					cb(scope.panes.length);
				});

			}
		};
	});
