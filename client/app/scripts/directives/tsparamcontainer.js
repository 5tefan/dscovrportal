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
				'<div class="row">'+
					'<div class="col-xs-4">'+
						'<h3> Configure Panes </h3>'+
					'</div>'+
					'<div class="col-xs-2">'+
						'<a class="btn btn-default" ng-click=addPane()> + add pane </a>'+
					'</div>'+
				'</div>'+
				'<div class="row paneEdit">'+
					'<div class="col-xs-12">'+
						'<div ts-param-pane params="params" pane="default_pane" removable="false" position="0"></div>'+
					'</div>'+
				'</div>'+
				'<div class="row pnaeEdit" ng-repeat="pane in panes">'+
					'<div class="col-xs-12">'+
						'<div ts-param-pane params="params" pane="pane" removable="true" rm-pane="rmPane($index)" position="getPosition(pane)"></div>'+
					'</div>'+
				'</div>',
			restrict: 'A',
			scope: {
				params : '=',
			},
			link: function postLink(scope, element, attrs) {
				
				//very basic, keep track of the panes
				// the panes themselves will keep track of 
				// their own parameters
				scope.default_pane = {};
				scope.panes = [];
				scope.addPane = function() {
					var pane = {};
					scope.panes.push(pane);
				};
				scope.getPosition = function(ofPane) {
					if (ofPane == scope.default_pane) {
						return 0;
					} else {
						return scope.panes.indexOf(ofPane) + 1;
					}
				};

				scope.rmPane = function(i) {
					scope.panes.splice(i, 1);
				};

				//listener for evalPanes so that we can get
				// how many panes we have up to the scope of the
				// ts plot controller
				scope.$on('evalPanes', function(e, cb) {
					cb(scope.panes.length + 1);
				});

			}
		};
	});
