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
				'<div class="row">'+
					'<div class="col-xs-5">'+
						'<div class="row">'+
							'<div class="col-xs-6">'+
								'<h4> Panel {{position}}</h4>'+
							'</div>'+
							'<div class="col-xs-3">'+
								'<a class="btn btn-default" ng-click=addSelection()> + param </a>'+
							'</div>'+
							'<div class="col-xs-2" ng-if="removable">'+
								'<a class="btn btn-default" ng-click=rmPane()> - panel </a>'+
							'</div>'+
						'</div>'+
						'<div class="row pane-edit">'+
							'<div param-edit params="params" selection="default_selection" removable="false"></div>'+
						'</div>'+
						'<div class="row pane-edit" ng-repeat="selection in selections">'+
								'<div param-edit params="params" selection="selection" removable="true" rm-selection="rmSelection($index)"></div>'+
						'</div>'+
					'</div>'+
					'<div class="col-xs-7">'+
						'<div class="row">'+
							'<div class="col-xs-5">'+
								'<h4> Advanced options </h4>'+
							'</div>'+
						'</div>'+
						'<div class="row">'+
							'<form>'+
								'<div class="checkbox">'+
									'<label><input type="checkbox" ng-model="adv.log">Log scale</label>'+
								'</div>'+
							'</form>'+
						'</div>'+
						'<div class="row">'+
							'<div ts-condition-container params="params" predef="predef_cond"></div>'+
						'</div>'+
					'</div>'+
				'</div>',
			restrict: 'A',
			scope: {
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

				scope.$watch('removable', function() {
					scope.removable = scope.$eval(attrs.removable);
				});

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
					scope.$broadcast('evalConditions', function(condition_str) {
						var return_string = scope.evalSelections();
						return_string += "$$" + condition_str;
						return_string += "*" + scope.adv.log
						cb(return_string);
					});
				});
			}
		};
	});
