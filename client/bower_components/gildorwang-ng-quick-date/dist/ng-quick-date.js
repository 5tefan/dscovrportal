(function() {
  var app;

  app = angular.module("ngQuickDate", []);

  app.provider("ngQuickDateDefaults", function() {
    return {
      options: {
        dateFormat: 'M/d/yyyy',
        timeFormat: 'h:mm a',
        labelFormat: null,
        placeholder: 'Click to Set Date',
        hoverText: null,
        buttonIconHtml: null,
        closeButtonHtml: '&times;',
        nextLinkHtml: 'Next &rarr;',
        prevLinkHtml: '&larr; Prev',
        disableTimepicker: false,
        disableClearButton: false,
        defaultTime: null,
        dayAbbreviations: ["Su", "M", "Tu", "W", "Th", "F", "Sa"],
        dateFilter: null,
        timezone: null,
        debug: false,
        parseDateFunction: function(str) {
          var seconds;
          seconds = Date.parse(str);
          if (isNaN(seconds)) {
            return null;
          } else {
            return new Date(seconds);
          }
        }
      },
      $get: function() {
        return this.options;
      },
      set: function(keyOrHash, value) {
        var k, v, _results;
        if (typeof keyOrHash === 'object') {
          _results = [];
          for (k in keyOrHash) {
            v = keyOrHash[k];
            _results.push(this.options[k] = v);
          }
          return _results;
        } else {
          return this.options[keyOrHash] = value;
        }
      }
    };
  });

  app.directive("quickDatepicker", [
    'ngQuickDateDefaults', '$filter', '$sce', '$log', function(ngQuickDateDefaults, $filter, $sce, $log) {
      return {
        restrict: "E",
        require: "?ngModel",
        scope: {
          dateFilter: '=?',
          disableTimepicker: '=?',
          disableClearButton: '=?',
          timezone: '=?',
          onChange: "&",
          required: '@',
          debug: '=?'
        },
        replace: true,
        link: function(scope, element, attrs, ngModelCtrl) {
          var addMonth, combineDateAndTime, dateToString, datepickerClicked, datesAreEqual, datesAreEqualToMinute, debounce, debugLog, emptyTime, getDate, getDay, getDaysInMonth, getFullYear, getHours, getMilliseconds, getMinutes, getMonth, getSeconds, initialize, isUTC, parseDateString, refreshView, setCalendarDate, setConfigOptions, setDate, setFullYear, setHours, setInputFieldValues, setMilliseconds, setMinutes, setMonth, setSeconds, setTime, setupCalendarView, stringToDate, templateDate;
          emptyTime = '00:00:00';
          debugLog = function(message) {
            if (scope.debug) {
              return $log.debug("[quickdate] " + message);
            }
          };
          templateDate = new Date("2015-01-01T12:00Z");
          initialize = function() {
            setConfigOptions();
            scope.toggleCalendar(false);
            scope.weeks = [];
            scope.inputDate = null;
            scope.inputTime = null;
            scope.invalid = true;
            if (typeof attrs.initValue === 'string') {
              ngModelCtrl.$setViewValue(attrs.initValue);
            }
            setCalendarDate();
            return refreshView();
          };
          scope.getDatePlaceholder = function() {
            return dateToString(templateDate, scope.getDateFormat());
          };
          scope.getTimePlaceholder = function() {
            return dateToString(templateDate, scope.getTimeFormat());
          };
          scope.getDateFormat = function() {
            if (isUTC()) {
              return "yyyy-MM-dd";
            } else {
              return scope.dateFormat;
            }
          };
          scope.getTimeFormat = function() {
            if (isUTC()) {
              return "HH:mm:ss";
            } else {
              return scope.timeFormat;
            }
          };
          scope.getLabelFormat = function() {
            var _ref;
            return (_ref = scope.labelFormat) != null ? _ref : scope.disableTimepicker ? scope.getDateFormat() : scope.getDateFormat() + " " + scope.getTimeFormat();
          };
          setConfigOptions = function() {
            var key, value, _ref;
            for (key in ngQuickDateDefaults) {
              value = ngQuickDateDefaults[key];
              if (key.match(/[Hh]tml/)) {
                scope[key] = $sce.trustAsHtml(ngQuickDateDefaults[key] || "");
              } else if (scope[key] == null) {
                scope[key] = (_ref = attrs[key]) != null ? _ref : ngQuickDateDefaults[key];
              }
            }
            if (attrs.iconClass && attrs.iconClass.length) {
              return scope.buttonIconHtml = $sce.trustAsHtml("<i ng-show='iconClass' class='" + attrs.iconClass + "'></i>");
            }
          };
          datepickerClicked = false;
          window.document.addEventListener('click', function(event) {
            if (scope.calendarShown && !datepickerClicked) {
              scope.toggleCalendar(false);
              scope.$apply();
            }
            return datepickerClicked = false;
          });
          angular.element(element[0])[0].addEventListener('click', function(event) {
            return datepickerClicked = true;
          });
          refreshView = function() {
            var date;
            date = ngModelCtrl.$modelValue ? parseDateString(ngModelCtrl.$modelValue) : null;
            setupCalendarView();
            setInputFieldValues(date);
            scope.mainButtonStr = date ? dateToString(date, scope.getLabelFormat()) : scope.placeholder;
            return scope.invalid = ngModelCtrl.$invalid;
          };
          setInputFieldValues = function(val) {
            if (val != null) {
              scope.inputDate = dateToString(val, scope.getDateFormat());
              return scope.inputTime = dateToString(val, scope.getTimeFormat());
            } else {
              scope.inputDate = null;
              return scope.inputTime = null;
            }
          };
          setCalendarDate = function(val) {
            var d;
            if (val == null) {
              val = null;
            }
            d = val != null ? new Date(val) : new Date();
            if (d.toString() === "Invalid Date") {
              d = new Date();
            }
            setDate(d, 1);
            return scope.calendarDate = d;
          };
          setupCalendarView = function() {
            var curDate, d, day, daysInMonth, numRows, offset, row, selected, today, weeks, _i, _j, _ref;
            offset = getDay(scope.calendarDate);
            daysInMonth = getDaysInMonth(getFullYear(scope.calendarDate), getMonth(scope.calendarDate));
            numRows = Math.ceil((offset + daysInMonth) / 7);
            weeks = [];
            curDate = new Date(scope.calendarDate);
            setDate(curDate, getDate(curDate) + (offset * -1));
            for (row = _i = 0, _ref = numRows - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; row = 0 <= _ref ? ++_i : --_i) {
              weeks.push([]);
              for (day = _j = 0; _j <= 6; day = ++_j) {
                d = new Date(curDate);
                setTime(d, emptyTime);
                selected = ngModelCtrl.$modelValue && d && datesAreEqual(d, ngModelCtrl.$modelValue);
                today = datesAreEqual(d, new Date());
                weeks[row].push({
                  date: d,
                  selected: selected,
                  disabled: typeof scope.dateFilter === 'function' ? !scope.dateFilter(d) : false,
                  other: getMonth(d) !== getMonth(scope.calendarDate),
                  today: today
                });
                setDate(curDate, getDate(curDate) + 1);
              }
            }
            return scope.weeks = weeks;
          };
          ngModelCtrl.$parsers.push(function(viewVal) {
            if (scope.required && (viewVal == null)) {
              ngModelCtrl.$setValidity('required', false);
              return null;
            } else if (angular.isDate(viewVal)) {
              ngModelCtrl.$setValidity('required', true);
              return viewVal;
            } else if (angular.isString(viewVal)) {
              ngModelCtrl.$setValidity('required', true);
              return scope.parseDateFunction(viewVal);
            } else {
              return null;
            }
          });
          ngModelCtrl.$formatters.push(function(modelVal) {
            if (angular.isDate(modelVal)) {
              return modelVal;
            } else if (angular.isString(modelVal)) {
              return scope.parseDateFunction(modelVal);
            } else {
              return void 0;
            }
          });
          isUTC = function() {
            return scope.timezone === "UTC";
          };
          getDate = function(date) {
            if (isUTC()) {
              return date.getUTCDate();
            } else {
              return date.getDate();
            }
          };
          getDay = function(date) {
            if (isUTC()) {
              return date.getUTCDay();
            } else {
              return date.getDay();
            }
          };
          getFullYear = function(date) {
            if (isUTC()) {
              return date.getUTCFullYear();
            } else {
              return date.getFullYear();
            }
          };
          getHours = function(date) {
            if (isUTC()) {
              return date.getUTCHours();
            } else {
              return date.getHours();
            }
          };
          getMilliseconds = function(date) {
            if (isUTC()) {
              return date.getUTCMilliseconds();
            } else {
              return date.getMilliseconds();
            }
          };
          getMinutes = function(date) {
            if (isUTC()) {
              return date.getUTCMinutes();
            } else {
              return date.getMinutes();
            }
          };
          getMonth = function(date) {
            if (isUTC()) {
              return date.getUTCMonth();
            } else {
              return date.getMonth();
            }
          };
          getSeconds = function(date) {
            if (isUTC()) {
              return date.getUTCSeconds();
            } else {
              return date.getSeconds();
            }
          };
          setDate = function(date, val) {
            if (isUTC()) {
              return date.setUTCDate(val);
            } else {
              return date.setDate(val);
            }
          };
          setFullYear = function(date, val) {
            if (isUTC()) {
              return date.setUTCFullYear(val);
            } else {
              return date.setFullYear(val);
            }
          };
          setHours = function(date, val) {
            if (isUTC()) {
              return date.setUTCHours(val);
            } else {
              return date.setHours(val);
            }
          };
          setMilliseconds = function(date, val) {
            if (isUTC()) {
              return date.setUTCMilliseconds(val);
            } else {
              return date.setMilliseconds(val);
            }
          };
          setMinutes = function(date, val) {
            if (isUTC()) {
              return date.setUTCMinutes(val);
            } else {
              return date.setMinutes(val);
            }
          };
          setMonth = function(date, val) {
            if (isUTC()) {
              return date.setUTCMonth(val);
            } else {
              return date.setMonth(val);
            }
          };
          setSeconds = function(date, val) {
            if (isUTC()) {
              return date.setUTCSeconds(val);
            } else {
              return date.setSeconds(val);
            }
          };
          setTime = function(date, val) {
            var parts, _ref, _ref1, _ref2;
            parts = (val != null ? val : emptyTime).split(':');
            setHours(date, (_ref = parts[0]) != null ? _ref : 0);
            setMinutes(date, (_ref1 = parts[1]) != null ? _ref1 : 0);
            setSeconds(date, (_ref2 = parts[2]) != null ? _ref2 : 0);
            return date;
          };
          addMonth = function(date, val) {
            return new Date(setMonth(new Date(date), getMonth(date) + val));
          };
          dateToString = function(date, format) {
            return $filter('date')(date, format, scope.timezone);
          };
          stringToDate = function(date) {
            if (typeof date === 'string') {
              return parseDateString(date);
            } else {
              return date;
            }
          };
          parseDateString = ngQuickDateDefaults.parseDateFunction;
          combineDateAndTime = function(date, time) {
            if (isUTC()) {
              return "" + date + "T" + time + "Z";
            } else {
              return "" + date + " " + time;
            }
          };
          datesAreEqual = function(d1, d2, compareTimes) {
            if (compareTimes == null) {
              compareTimes = false;
            }
            if (compareTimes) {
              return (d1 - d2) === 0;
            } else {
              d1 = stringToDate(d1);
              d2 = stringToDate(d2);
              return d1 && d2 && (getFullYear(d1) === getFullYear(d2)) && (getMonth(d1) === getMonth(d2)) && (getDate(d1) === getDate(d2));
            }
          };
          datesAreEqualToMinute = function(d1, d2) {
            if (!(d1 && d2)) {
              return false;
            }
            return parseInt(d1.getTime() / 60000) === parseInt(d2.getTime() / 60000);
          };
          getDaysInMonth = function(year, month) {
            return [31, ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
          };
          debounce = function(func, wait) {
            var args, context, later, result, timeout, timestamp;
            timeout = args = context = timestamp = result = null;
            later = function() {
              var last;
              last = +new Date() - timestamp;
              if (last < wait && last > 0) {
                return timeout = setTimeout(later, wait - last);
              } else {
                return timeout = null;
              }
            };
            return function() {
              context = this;
              args = arguments;
              timestamp = +new Date();
              if (!timeout) {
                timeout = setTimeout(later, wait);
                result = func.apply(context, args);
                context = args = null;
              }
              return result;
            };
          };
          ngModelCtrl.$render = function() {
            setCalendarDate(ngModelCtrl.$viewValue);
            return refreshView();
          };
          ngModelCtrl.$viewChangeListeners.unshift(function() {
            setCalendarDate(ngModelCtrl.$viewValue);
            refreshView();
            if (scope.onChange) {
              return scope.onChange();
            }
          });
          scope.$watch('calendarShown', function(newVal, oldVal) {
            var dateInput;
            if (newVal) {
              dateInput = angular.element(element[0].querySelector(".quickdate-date-input"))[0];
              dateInput.select();
              return refreshView();
            }
          });
          scope.$watch('timezone', function(newVal, oldVal) {
            if (newVal === oldVal) {
              return;
            }
            return ngModelCtrl.$render();
          });
          scope.$watch('disableTimepicker', function(newVal, oldVal) {
            if (newVal === oldVal) {
              return;
            }
            return refreshView();
          });
          scope.toggleCalendar = debounce(function(show) {
            if (isFinite(show)) {
              return scope.calendarShown = show;
            } else {
              return scope.calendarShown = !scope.calendarShown;
            }
          }, 150);
          scope.selectDate = function(date, closeCalendar) {
            var changed;
            if (closeCalendar == null) {
              closeCalendar = true;
            }
            debugLog("selectDate: " + (date != null ? date.toISOString() : void 0));
            changed = (!ngModelCtrl.$viewValue && date) || (ngModelCtrl.$viewValue && !date) || ((date && ngModelCtrl.$viewValue) && (date.getTime() !== ngModelCtrl.$viewValue.getTime()));
            if (typeof scope.dateFilter === 'function' && !scope.dateFilter(date)) {
              return false;
            }
            ngModelCtrl.$setViewValue(date);
            if (closeCalendar) {
              scope.toggleCalendar(false);
            }
            return true;
          };
          scope.selectDateWithMouse = function(date) {
            scope.inputDate = dateToString(date, scope.getDateFormat());
            return scope.selectDateFromInput(scope.disableTimepicker);
          };
          scope.selectDateFromInput = function(closeCalendar) {
            var err, tmpDate, tmpDateAndTime, tmpTime, _ref;
            if (closeCalendar == null) {
              closeCalendar = false;
            }
            try {
              tmpDate = parseDateString(combineDateAndTime(scope.inputDate, scope.defaultTime || emptyTime));
              if (tmpDate == null) {
                throw new Error('Invalid Date');
              }
              if (!scope.disableTimepicker && ((_ref = scope.inputTime) != null ? _ref.length : void 0)) {
                tmpTime = scope.disableTimepicker ? emptyTime : scope.inputTime;
                tmpDateAndTime = parseDateString(combineDateAndTime(scope.inputDate, tmpTime));
                if (tmpDateAndTime == null) {
                  throw new Error('Invalid Time');
                }
                tmpDate = tmpDateAndTime;
              }
              if (!datesAreEqualToMinute(ngModelCtrl.$viewValue, tmpDate)) {
                if (!scope.selectDate(tmpDate, false)) {
                  throw new Error('Invalid Date');
                }
              }
              if (closeCalendar) {
                scope.toggleCalendar(false);
              }
              scope.inputDateErr = false;
              return scope.inputTimeErr = false;
            } catch (_error) {
              err = _error;
              if (err.message === 'Invalid Date') {
                return scope.inputDateErr = true;
              } else if (err.message === 'Invalid Time') {
                return scope.inputTimeErr = true;
              }
            }
          };
          scope.onDateInputTab = function() {
            if (scope.disableTimepicker) {
              scope.toggleCalendar(false);
            }
            return true;
          };
          scope.onTimeInputTab = function() {
            scope.toggleCalendar(false);
            return true;
          };
          scope.nextMonth = function() {
            setCalendarDate(addMonth(scope.calendarDate, 1));
            return refreshView();
          };
          scope.prevMonth = function() {
            setCalendarDate(addMonth(scope.calendarDate, -1));
            return refreshView();
          };
          scope.clear = function() {
            return scope.selectDate(null, true);
          };
          return initialize();
        },
        template: "<div class='quickdate'>\n  <a href='' ng-focus='toggleCalendar()' ng-click='toggleCalendar()'\n      class='quickdate-button' title='{{hoverText}}'>\n    <div ng-hide='iconClass' ng-bind-html='buttonIconHtml'></div>\n    {{mainButtonStr}}\n  </a>\n  <div class='quickdate-popup' ng-class='{open: calendarShown}'>\n    <a href='' tabindex='-1' class='quickdate-close' ng-click='toggleCalendar()'>\n      <div ng-bind-html='closeButtonHtml'></div>\n    </a>\n    <div class='quickdate-text-inputs'>\n      <div class='quickdate-input-wrapper'>\n        <label>Date</label>\n        <input class='quickdate-date-input' ng-class=\"{'ng-invalid': inputDateErr}\"\n               name='inputDate' type='text' ng-model='inputDate'\n               placeholder='{{ getDatePlaceholder() }}'\n               ng-enter=\"selectDateFromInput(true)\"\n               ng-blur=\"selectDateFromInput(false)\"\n               on-tab='onDateInputTab()' />\n      </div>\n      <div class='quickdate-input-wrapper' ng-hide='disableTimepicker'>\n        <label>Time</label>\n        <input class='quickdate-time-input'\n               ng-class=\"{'ng-invalid': inputTimeErr}\"\n               name='inputTime'\n               type='text'\n               ng-model='inputTime'\n               placeholder='{{ getTimePlaceholder() }}'\n               ng-enter=\"selectDateFromInput(true)\"\n               ng-blur=\"selectDateFromInput(false)\"\n               on-tab='onTimeInputTab()'>\n      </div>\n    </div>\n    <div class='quickdate-calendar-header'>\n      <a href='' class='quickdate-prev-month quickdate-action-link' tabindex='-1' ng-click='prevMonth()'>\n        <div ng-bind-html='prevLinkHtml'></div>\n      </a>\n      <span class='quickdate-month'>{{calendarDate | date:'MMMM yyyy'}}</span>\n      <a href='' class='quickdate-next-month quickdate-action-link' ng-click='nextMonth()' tabindex='-1' >\n        <div ng-bind-html='nextLinkHtml'></div>\n      </a>\n    </div>\n    <table class='quickdate-calendar'>\n      <thead>\n        <tr>\n          <th ng-repeat='day in dayAbbreviations'>{{day}}</th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr ng-repeat='week in weeks'>\n          <td ng-mousedown='selectDateWithMouse(day.date)'\n              ng-click='$event.preventDefault()'\n              ng-class='{\"other-month\": day.other, \"disabled-date\": day.disabled, \"selected\": day.selected, \"is-today\": day.today}'\n              ng-repeat='day in week'>{{day.date | date:'d':timezone}}</td>\n        </tr>\n      </tbody>\n    </table>\n    <div class='quickdate-popup-footer'>\n      <a href='' class='quickdate-clear' tabindex='-1' ng-hide='disableClearButton' ng-click='clear()'>Clear</a>\n    </div>\n  </div>\n</div>"
      };
    }
  ]);

  app.directive('ngEnter', function() {
    return function(scope, element, attr) {
      return element.bind('keydown keypress', function(e) {
        if (e.which === 13) {
          scope.$apply(attr.ngEnter);
          return e.preventDefault();
        }
      });
    };
  });

  app.directive('onTab', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attr) {
        return element.bind('keydown keypress', function(e) {
          if ((e.which === 9) && !e.shiftKey) {
            return scope.$apply(attr.onTab);
          }
        });
      }
    };
  });

}).call(this);
