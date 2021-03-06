'use strict';

/**
 * @ngdoc directive
 * @name dscovrDataApp.directive:timeRange
 * @description
 * # timeRange
 */
angular.module('dscovrDataApp')
	.directive('timeRange', function (dscovrUtil) {
		return {
			template: 
					'<div class="row no-padding-right" style="margin-bottom: 15px; clear: both">'+
						'<div class="col-xs-12 no-padding-right">'+
							'<h5>Begin Date Time</h5>'+
							'<quick-datepicker ng-model="selected_begin" on-change="onchange_begin()" time-format="HH:mm" icon-class="glyphicon glyphicon-calendar" disable-clear-button="true"></quick-datepicker>'+
						'</div>'+
						'<div class="col-xs-12 no-padding-right">'+
							'<h5>End Date Time</h5>'+
							'<quick-datepicker ng-model="selected_end" on-change="onchange_end()" time-format=" HH:mm" icon-class="glyphicon glyphicon-calendar" disable-clear-button="true"></quick-datepicker>'+
						'</div>'+
					'</div>',
			restrict: 'A',
			scope: {
				predef : '=',
			},
			link: function postLink(scope) {
				scope.selected_begin = dscovrUtil.getMissionEnd()
                                    .startOf('day').toDate();
                                //    .subtract(1, 'days').startOf('day').toDate();
				scope.selected_end = dscovrUtil.getMissionEnd().endOf('day').toDate();
				scope.time_difference = scope.selected_end.getTime() - scope.selected_begin.getTime();

				scope.$on('evalTimerange', function(e, cb) {
					cb(scope.evalTimerange());
				});

				var unwatch_predef = scope.$watch('predef', function() {
					if (scope.predef) {
                                                // inverse of what's happening in scope.evalTimerange, add offset
                                                // because ms coming in is UTC, add offset so that local time display
                                                // *looks* like utc
                                                var minutes_to_ms = 60 * 1000;
                                                var _ = new Date();
                                                var offset = _.getTimezoneOffset() * minutes_to_ms;
						scope.selected_begin = new Date(+scope.predef[0] + offset);
						scope.selected_end = new Date(+scope.predef[1] + offset);
						unwatch_predef();
					}
				});

				scope.evalTimerange = function() {
                                        // subtract utc offset to make request appear as though it was in utc
                                        // quick-datepicker shows localtime, but with offset it *looks* like utc
                                        var minutes_to_ms = 60 * 1000;
                                        var _ = new Date();
                                        var offset = _.getTimezoneOffset() * minutes_to_ms;
					return [
                                            scope.selected_begin.getTime() - offset,
                                             scope.selected_end.getTime() - offset
                                        ];
				};

				scope.onchange_begin = function() {
					// preserve the interval between start and and if either begin is moved after end or 
					// end moved before begin subject to the condition that it doesn't go out of the valid
					// time bounds
					if (moment(scope.selected_begin).isSameOrAfter(scope.selected_end)) {
						var new_end = moment(scope.selected_begin).add(scope.time_difference, 'ms');
						if (dscovrUtil.getMissionEnd().isSameOrAfter( new_end )) {
							scope.selected_end = new_end.toDate();
						} else {
							scope.selected_end = dscovrUtil.getMissionEnd().toDate();
						}
					} else {
						scope.time_difference = scope.selected_end.getTime() - scope.selected_begin.getTime();
					}
				};

				scope.onchange_end = function() {
					// preserve the interval between start and and if either begin is moved after end or 
					// end moved before begin subject to the condition that it doesn't go out of the valid
					// time bounds
					if (moment(scope.selected_end).isSameOrBefore(scope.selected_begin)) {
						var new_begin = moment(scope.selected_end).subtract(scope.time_difference, 'ms');
						if (dscovrUtil.getMissionBegin().isSameOrBefore( new_begin )) {
							scope.selected_begin = new_begin.toDate();
						} else {
							scope.selected_begin = dscovrUtil.getMissionBegin().toDate();
						}
					} else {
						scope.time_difference = scope.selected_end.getTime() - scope.selected_begin.getTime();
					}
				};

				// tell controler this directive is ready
				scope.$emit('timerangeReady');
			}
		};
	});
