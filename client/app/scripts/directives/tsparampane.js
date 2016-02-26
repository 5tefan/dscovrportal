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
				'<div class="col-xs-12">'+
					'<div class="row margin-b10">'+
						'<div class="col-xs-3 ts-param-pane-panel-title">'+
							'<h4 class="ts-param-pane-panel-title"> Panel {{position}}</h4>'+
						'</div>'+
						'<div class="ts-param-pane-remove-pane" class="col-xs-2">'+
							'<a ng-if="removable" class="btn btn-default btn-sm" ng-click=rmPane($index)><span class="glyphicon glyphicon-remove"> </span></a>'+
						'</div>'+
					'</div>'+
					'<div class="row pane-edit" ng-repeat="selection in selections">'+ // and then other selections
							'<div param-edit selection="selection" removable="selections.length > 1" rm-selection="rmSelection($index)"></div>'+
					'</div>'+
					'<form class="col-xs-5">'+
						'<div class="checkbox">'+
							'<label><input type="checkbox" ng-model="adv.log">Log scale</label>'+
						'</div>'+
					'</form>'+
					'<div class="col-xs-4 col-xs-offset-1">'+
						'<a class="btn btn-default btn-sm" ng-click=addSelection()> + variable </a>'+
					'</div>'+
				'</div>',
			restrict: 'A',
			scope: {
				pane : '=',
				removable : '=',
				rmPane : '&', //function to remove this panel
				position : '=', //function to determine which panel this is
			},
			link: function postLink(scope) {

				scope.selections = [{}];
				scope.adv = {
					log: false,
				};
				var unwatch_predef = scope.$watch('pane.predef', function() {
					if (scope.pane && scope.pane.predef) {
						// scope.pane.predef comes in as a string looking like
						// m1m:bt;m1m:bx_gsm*linear
						// using _ as a tmp var to split on *
						var _ = scope.pane.predef.split('*');
						if (!_[0]) { return; }
						//parse the log scale setting
						if (_[1]) { // if the log or linear option is explicitly set
							var is_log = _[1];
							if (is_log.charAt( is_log.length - 1 ) === ";" ) { is_log = is_log.slice(0, -1); }
							scope.adv.log = (is_log === 'log');
						}

						//parse the parameters to plot
						// _[0] should be something like just
						// m1m:bt;m1m:bx_gsm 
						scope.selections = [];
						_[0].split(';').map( function(predef) {
							scope.selections.push( {predef: predef} );
						});
						unwatch_predef();
					}
				});

				scope.addSelection = function() {
					scope.selections.push({});
				};

				scope.rmSelection = function(i) {
					if (scope.selections.length > 1) {
						scope.selections.splice(i, 1);
					}
				};

				scope.getOrCreateConstruct = function(selection) {
					// solution to the race condition, grab the actual prod and 
					// param from the selection if the construct isn't there yet
					if (selection.construct) {
						return selection.construct;
					} else if (selection.prod && selection.param) {
						return selection.prod + ":" + selection.param;
					} // else 
					return "";
				};

				scope.evalParameters = function() {
					// race condition in play here, sometimes construct attribute not bound when this called
					// so falling back and using scope.default_selection.(prod|param) directly. In the future
					// maybe implement some kind of signal at the tail of the directive chain which signals 
					// when it is done initializing
					var selection_str = "";
					for (var each in scope.selections) {
						selection_str += (selection_str?';':'') + scope.getOrCreateConstruct(scope.selections[each]);
					}
					//also add the log selection`
					if (scope.adv.log) {
						selection_str += '*log';
					}
					return selection_str;
				}; // end scope.evalSelections function

				// listen for evalParameters event, broadcast from parent when
				// when the parent needs to know what parameters are selected for plotting
				scope.$on('evalParameters', function(e, cb) {
					// only add *log, otherwise nothing because linear is defualt
					cb(scope.evalParameters());
				});

			}
		};
	});
