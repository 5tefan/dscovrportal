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
				'<div class="row" style="margin-top: 20px; margin-bottom: 20px;">'+
					'<div class="col-xs-4">'+
						'<h5>Filter where:</h5>'+
					'</div>'+
					'<div class="col-xs-2">'+
						'<a class="btn btn-default" ng-click=addExclude()> + condition </a>'+
					'</div>'+
				'</div>'+
				'<div class="row conditionEdit">'+
					'<div condition-edit params="params" condition="default_exclude" removable="false"></div>'+
				'</div>'+
				'<div class="row conditionEdit" ng-repeat="exclude in excludes">'+
						'<div condition-edit params="params" condition="exclude" removable="true" rm-condition="rmExclude($index)"></div>'+
	//			'</div>'+
	//			'<div class="row" style="margin-top: 20px; margin-bottom: 20px;">'+
	//				'<div class="col-xs-4">'+
	//					'<h5>Highlight where:</h5>'+
	//				'</div>'+
	//				'<div class="col-xs-2">'+
	//					'<a class="btn btn-default" ng-click=addHighlight()> + condition </a>'+
	//				'</div>'+
	//			'</div>'+
	//			'<div class="row conditionEdit">'+
	//				'<div condition-edit params="params" condition="default_highlight" removable="false"></div>'+
	//			'</div>'+
	//			'<div class="row conditionEdit" ng-repeat="highlight in highlights">'+
	//					'<div condition-edit params="params" condition="highlight" removable="true" rm-condition="rmHighlight($index)"></div>'+
				'</div>',
			restrict: 'A',
			scope: {
				params : '=',
				predef : '=',
			},
			link: function postLink(scope, element, attrs) {
				//the default highlight that you can't delete
				scope.default_highlight = {};
				//arry for any more highlights added with the + button
				scope.highlights = [];
				scope.default_exclude = {};
				scope.excludes = [];


				//handle predef conditions
				var unwatch_predef = scope.$watch('predef', function() {
					if (scope.predef) {
						console.log(scope.predef);
						var first_ex = true;
						var first_hi = true;
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
									if (first_ex) {
										scope.default_exclude = condition;
										first_ex = false;
									} else {
										scope.excludes.push(condition);
									}
								} else {
									if (first_hi) {
										scope.default_highlight = condition;
										first_hi = false;
									} else {
										scope.highlights.push(condition);
									}

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
					if (scope.default_exclude.construct) {
						return_str = scope.default_exclude.construct + "@0;";
					} 
					for (var each in scope.excludes) {
						if (scope.excludes[each].construct) {
							return_str += scope.excludes[each].construct + "@0;";
						}
					}
					if (scope.default_highlight.construct) {
						return_str += scope.default_highlight.construct + "@1;";
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
