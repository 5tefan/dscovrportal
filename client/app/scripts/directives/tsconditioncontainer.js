'use strict';

/**
 * @ngdoc directive
 * @name dscovrDataApp.directive:tsConditionContainer
 * @description
 * # tsConditionContainer
 */
angular.module('dscovrDataApp')
	.directive('tsConditionContainer', function () {
		return {
			template: 
				'<div class="row">'+
					'<div class="col-xs-4">'+
						'<h5>Constrain where:</h5>'+
					'</div>'+
					'<div class="col-xs-2">'+
						'<a class="btn btn-default" ng-click=addExclude()> + constraint </a>'+
					'</div>'+
				'</div>'+
				'<div class="row condition-edit" ng-repeat="exclude in excludes">'+
						'<div condition-edit params="params" condition="exclude" removable="true" rm-condition="rmExclude($index)"></div>'+
				'</div>',
			restrict: 'A',
			scope: {
				params : '=',
				predef : '=',
			},

			link: function postLink(scope, element, attrs) {
				//arry for any more highlights added with the + button
				scope.highlights = [];
				scope.excludes = [];
				//handle predef conditions
				var unwatch_predef = scope.$watch('predef', function() {
					if (scope.predef) {
						for (var i in scope.predef) {
							if (scope.predef[i]) {
								var cond = scope.predef[i].split('@')[0].split(':');
								var type = scope.predef[i].split('@')[1];
								var condition = {
									prod: cond[0],
									param: cond[1],
									relation: cond[2],
									value: Number(cond[3]),
								}
								if (+type == 0) {
									scope.excludes.push(condition);
								} else {
									scope.highlights.push(condition);
								}
							}
						}
						unwatch_predef();
					}
				});


				scope.addHighlight = function() {
					var highlight = {};
					scope.highlights.push(highlight);
				};
				scope.rmHighlight = function(i) {
					scope.highlights.splice(i, 1);
				};

				scope.addExclude = function() {
					var exclude = {};
					scope.excludes.push(exclude);
				};
				scope.rmExclude = function(i) {
					scope.excludes.splice(i, 1);
				};

				scope.evalString = function() {
					var return_str = "";
					for (var each in scope.excludes) {
						if (scope.excludes[each].construct) {
							return_str += scope.excludes[each].construct + "@0;";
						}
					}
					for (var each in scope.highlights) {
						if (scope.highlights[each].construct) {
							return_str += scope.highlights[each].construct + "@1;";
						}
					}
					return return_str;
				}

				// listen for evalClikced event, broadcast from parent when
				// when the parent needs the highlights to be evaluated.
				scope.$on('evalConditions', function(e, cb) {
					console.log("evalConditions");
					cb(scope.evalString());
				});
			}
		};
	});
