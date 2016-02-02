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
				'<div class="col-xs-5">'+
					'<div class="row">'+
						'<div class="col-xs-5 ts-param-pane-panel-title">'+
							'<h4 class="ts-param-pane-panel-title"> Panel {{position}}</h4>'+
						'</div>'+
						'<div class="col-xs-3">'+
							'<a class="btn btn-default" ng-click=addSelection()> + param </a>'+
						'</div>'+
					'</div>'+
					'<div class="row pane-edit">'+
						'<div param-edit class="ts-param-pane-param-edit" params="params" selection="default_selection" removable="false"></div>'+
					'</div>'+
					'<div class="row pane-edit" ng-repeat="selection in selections">'+
							'<div param-edit params="params" selection="selection" removable="true" rm-selection="rmSelection($index)"></div>'+
					'</div>'+
				'</div>'+
				'<div class="col-xs-5">'+
					'<div class="row">'+
						'<div class="col-xs-11 col-xs-offset-1" ng-if="adv.show">'+
							'<a ng-click="adv.show = !adv.show"><h4 class="vis-adv-h4"><span class="glyphicon glyphicon-menu-down" aria-hidden="true"></span> Advanced options </h4></a>'+
						'</div>'+
						'<div class="col-xs-11 col-xs-offset-1" ng-if="!adv.show">'+
							'<a ng-click="adv.show = !adv.show"><h4 class="vis-adv-h4"><span class="glyphicon glyphicon-menu-right" aria-hidden="true"></span> Advanced options </h4></a>'+
						'</div>'+
					'</div>'+
					'<div class="row" ng-show="adv.show">'+
						'<form>'+
							'<div class="checkbox">'+
								'<label><input type="checkbox" ng-model="adv.log">Log scale</label>'+
							'</div>'+
						'</form>'+
					'</div>'+
					'<div class="row" ng-show="adv.show">'+
						'<div ts-condition-container params="params" predef="predef_cond"></div>'+
					'</div>'+
				'</div>',
			restrict: 'A',
			scope: {
				removable : '=',
				params : '=',
				pane : '=',
				rmPane : '&', //function to remove this panel
				position : '=', //function to determine which panel this is
			},
			link: function postLink(scope, element, attrs) {

				scope.default_selection = {};
				scope.selections = [];
				scope.adv = {
					log: false
				};
				scope.$watch('pane', function() {
					console.log(scope.pane);
					if (scope.pane.predef) {
						//parse the log scale setting
						var is_log = scope.pane.predef.split('*')[1];
						if (is_log.charAt( is_log.length - 1 ) == ";" ) { is_log = is_log.slice(0, -1); }
						scope.adv.log = ( is_log == 'true' );

						//parse the parameters to plot
						var params = scope.pane.predef.split('$$')[0].split(';');
						for (var i in params) {
							if (params[i]) {
								var prodparam = params[i].split(':');
								var selection = {
									prod: prodparam[0],
									param: prodparam[1]
								}
								if (i == 0) {
									console.log("parsed default_selection: " + selection);
									scope.default_selection = selection;
								} else {
									scope.selections.push(selection);
								}
				
							}
						}
						//parse the exclude and highlight conditions
						var conds = scope.pane.predef.split('$$')[1].split('*')[0];
						scope.predef_cond = conds.split(';');
					}
				});

				scope.addSelection = function() {
					var selection = {};
					scope.selections.push(selection);
				};

				scope.rmSelection = function(i) {
					scope.selections.splice(i, 1);
				};

				scope.evalSelections = function() {
					var selection_str = "";
					console.log("default selection while evalSelection: " + JSON.stringify(scope.default_selection));
					// race condition in play here, sometimes construct attribute not bound when this called
					// so falling back and using scope.default_selection.(prod|param) directly. In the future
					// maybe implement some kind of signal at the tail of the directive chain which signals 
					// when it is done initializing
					//selection_str = scope.default_selection.construct + ";";
					if ( scope.default_selection.construct ) {
						selection_str = scope.default_selection.construct + ";";
					} else if (scope.default_selection.prod && scope.default_selection.param) {
						selection_str = scope.default_selection.prod + ":" + scope.default_selection.param + ";";
					}
					for (var each in scope.selections) {
						if (scope.selections[each].construct) {
							selection_str += scope.selections[each].construct + ";";
						} else if (scope.selections[each].prod && scope.selections[each].param) {
							selection_str += scope.selections[each].prod + ":" +
								scope.selections[each].param + ";"
						}
					}
					console.log("selection_str: " + selection_str);
					return selection_str;
				}

				// listen for evalClikced event, broadcast from parent when
				// when the parent needs the conditions to be evaluated.
				scope.$on('evalSelections', function(e, cb) {
					console.log("evalSelections cb");
					scope.$broadcast('evalConditions', function(condition_str) {
						console.log("evalConditions cb");
						var return_string = scope.evalSelections();
						return_string += "$$" + condition_str;
						return_string += "*" + scope.adv.log
						cb(return_string);
					});
				});
			}
		};
	});
