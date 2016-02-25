"use strict";angular.module("dscovrDataApp",["ngRoute","ngCookies","ngQuickDate"]).config(["$routeProvider","ngQuickDateDefaultsProvider",function(a,b){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).when("/vis",{redirectTo:"/vis/summary"}).when("/vis/summary/:arg?/:argg?",{templateUrl:"views/vis/summary.html",controller:"VisSummaryCtrl"}).when("/vis/ts/:arg?/:argg?/:arggg?",{templateUrl:"views/vis/ts.html",controller:"VisTsCtrl"}).when("/vis/scatter/:arg?/:argg?/:arggg?",{templateUrl:"views/vis/scatter.html",controller:"VisScatterCtrl"}).when("/download/:arg?/:argg?",{templateUrl:"views/download.html",controller:"DownloadCtrl"}).when("/vis/color/ts/:arg?/:argg?/:arggg?",{templateUrl:"views/vis/color/ts.html",controller:"VisColorTsCtrl"}).otherwise({redirectTo:"/"});var c=moment.utc("02-03-2015","DD-MM-YYYY"),d=moment.utc().subtract(1,"days").startOf("day");b.set("dateFilter",function(a){return moment(a).isBetween(c,d)}),b.set("placeholder","---------------"),b.set("closeButtonHtml","ok")}]),angular.module("dscovrDataApp").controller("MainCtrl",["$scope","$location","$anchorScroll",function(a,b,c){a.scrollTo=function(a){b.hash(a),c()}}]),angular.module("dscovrDataApp").controller("NavCtrl",["$scope","$location","$rootScope",function(a,b,c){a.isActive=function(a){return a===b.path().split("/")[1]},"function"==typeof gas&&c.$on("$routeChangeSuccess",function(){gas("_","pageview",b.url())})}]),angular.module("dscovrDataApp").controller("DownloadCtrl",["$scope","$routeParams","$location","$route","dscovrDataAccess",function(a,b,c,d,e){e.getProducts2().then(function(c){if(b.argg){var d=b.argg.split(";");a.products=c.map(function(a){return d.indexOf(a.product)>-1&&(a.selected=!0),a})}else a.products=c.map(function(a){return a.selected=!0,a})}),a.parse_arg=function(b){if(b){var c=b.split(";");2!==c.length||isNaN(c[0])||isNaN(c[1])||(e.getFiles2(c[0],c[1]).then(function(b){a.files=b}),a.predef_time=c)}},a.get_selected_products=function(){var b=[];for(var c in a.products)a.products[c].selected&&b.push(a.products[c].product);return b},a.make_wget=function(){if(a.files){var b=a.get_selected_products(),c=[];c.push("wget");for(var d in a.files)for(var e in b)c.push(a.files[d][b[e]]);return c.join(" ")}};var f=d.current;a.$on("$locationChangeSuccess",function(){"DownloadCtrl"===d.current.$$route.controller&&(d.current=f)}),a.selected_products_onchange=function(){if(a.products){var b=a.get_selected_products();c.url("/download/"+a.predef_time.join(";")+"/"+b.join(";")),c.replace()}},a.$on("datechange",function(b,d){var e=a.get_selected_products();c.url("/download/"+d.join(";")+"/"+e.join(";")),a.parse_arg(d.join(";"))}),b.arg&&a.parse_arg(b.arg)}]),angular.module("dscovrDataApp").controller("VisSummaryCtrl",["$scope","$routeParams","$cookieStore","$location","$route","dscovrUtil",function(a,b,c,d,e,f){a.summary_frame_info={"6h":{dt:864e5,src:"plots/dscovr_6hr_plots/{{year}}/{{month}}/{{year}}{{month}}{{day}}{{hour}}-6hr.png"},"1d":{dt:864e5,src:"plots/dscovr_1day_plots/{{year}}/{{month}}/{{year}}{{month}}{{day}}-day.png"},"3d":{dt:2592e5,src:"plots/dscovr_3day_plots/{{year}}/{{year}}{{month}}{{day}}-3day.png"},"7d":{dt:6048e5,src:"plots/dscovr_7day_plots/{{year}}/{{year}}{{month}}{{day}}-7day.png"},"1m":{dt:24192e5,src:"plots/dscovr_month_plots/{{year}}/{{year}}{{month}}-month.png"}},a.parse_args=function(b,c){switch(b){case"6h":case"1d":case"3d":case"7d":case"1m":a.frame_size=b,f.dateInRange(c)?a.summary_date=moment.utc(+c).toDate():a.summary_date=moment.utc().subtract(1,"days").toDate(),"3d"==a.frame_size||"7d"==a.frame_size?a.summary_file_date=moment.utc(f.getMissionBegin().valueOf()+a.summary_frame_info[a.frame_size].dt*Math.floor((a.summary_date.valueOf()-f.getMissionBegin().valueOf())/a.summary_frame_info[a.frame_size].dt)):"1d"==a.frame_size||"6h"==a.frame_size?a.summary_file_date=moment.utc(a.summary_date).startOf("day"):"1m"==a.frame_size&&(a.summary_file_date=moment.utc(a.summary_date).startOf("month")),"1m"==a.frame_size?(a.summary_prev_ms=moment.utc(a.summary_date).subtract(1,"months").valueOf(),a.summary_end_ms=moment.utc(a.summary_file_date).add(1,"months").valueOf()):(a.summary_prev_ms=+a.summary_date-a.summary_frame_info[a.frame_size].dt,a.summary_end_ms=+a.summary_file_date+a.summary_frame_info[a.frame_size].dt);break;default:d.url("/vis/summary/7d"),d.replace(),a.parse_args("7d")}},b.arg?a.parse_args(b.arg,b.argg):c.get("summary.arg")&&a.parse_args(c.get("summary.arg"),c.get("summary.argg"));var g=e.current;a.$on("$locationChangeSuccess",function(a){"VisSummaryCtrl"==e.current.$$route.controller&&(e.current=g)}),a.locationchange=function(b,e){a.frame_size=b||a.frame_size;var f=e||a.summary_date.valueOf();c.put("summary.arg",a.frame_size),c.put("summary.argg",f),d.url("/vis/summary/"+a.frame_size+"/"+f),a.parse_args(a.frame_size,f)},a.get_plotsrc=function(){if(a.frame_size){var b=a.summary_frame_info[a.frame_size].src;return b=b.split("{{year}}").join(a.summary_file_date.format("YYYY")),b=b.split("{{month}}").join(a.summary_file_date.format("MM")),b=b.split("{{day}}").join(a.summary_file_date.format("DD"))}},a.get_plotsrc_6h=function(b){if(a.frame_size){var c=a.summary_frame_info[a.frame_size].src;return c=c.split("{{year}}").join(a.summary_file_date.format("YYYY")),c=c.split("{{month}}").join(a.summary_file_date.format("MM")),c=c.split("{{day}}").join(a.summary_file_date.format("DD")),c=10>b?c.split("{{hour}}").join("0"+b):c.split("{{hour}}").join(b)}}}]),angular.module("dscovrDataApp").directive("conditionContainer",function(){return{template:'<div class="row"><div class="col-xs-5"><h5>Constrain where:</h5></div><div class="col-xs-2"><a class="btn btn-default btn-sm" ng-click=addCondition()> + constraint </a></div></div><div class="row condition-edit" ng-repeat="condition in conditions"><div condition-edit params="params" condition="condition" rm-condition="rmCondition($index)"></div></div>',restrict:"A",scope:{predef:"="},link:function(a){a.conditions=[];var b=a.$watch("predef",function(){a.predef&&(console.log(a.predef),a.predef.split(";").map(function(b){a.conditions.push({predef:b})}),b())});a.addCondition=function(){var b={};a.conditions.push(b)},a.rmCondition=function(b){a.conditions.length>0&&a.conditions.splice(b,1)},a.evalConditions=function(){var b="";for(var c in a.conditions)a.conditions[c].construct?b+=(b?";":"")+a.conditions[c].construct:a.conditions[c].predef&&(b+=(b?";":"")+a.conditions[c].predef);return b},a.$on("evalConditions",function(b,c){c(a.evalConditions())})}}}),angular.module("dscovrDataApp").directive("conditionEdit",function(){return{template:'<div class="no-padding-right col-xs-3"><select class="form-control condition-edit-select" ng-model="prod" ng-options="prod for prod in keys(params)"><option value="" disabled selected>-product-</option></select></div><div class="no-padding-right no-padding-left col-xs-3"><select class="form-control condition-edit-select" ng-model="param" ng-options="param for param in keys(params[prod])"><option value="" disabled selected>-variable-</option></select></div><div class="no-padding-right no-padding-left col-xs-2"><select class="form-control condition-edit-select" ng-model="relation"><option value="gt"> &gt; </option><option value="lt"> &lt; </option><option value="eq"> = </option><option value="ge"> &gt;= </option><option value="le"> &lt;= </option></select></div><div class="no-padding-right no-padding-left col-xs-3"><input type="number" class="form-control" placeholder="val" ng-model="value" ng-required></div><div class="col-xs-1 no-padding-right no-padding-left"><a class="btn btn-default" ng-click=rmCondition($index)><span class="glyphicon glyphicon-remove"></span></a></div>',restrict:"A",scope:{condition:"=",rmCondition:"&"},link:function(a){var b=a.$watch("$root.params",function(){if(a.$root.params){a.params=a.$root.params;var c=a.$watch("condition.predef",function(){if(a.condition&&a.condition.predef){var b=a.condition.predef.split(":");a.prod=b[0],a.param=b[1],a.relation=b[2],a.value=+b[3],c()}});b()}});a.keys=function(a){return a?Object.keys(a):void 0},a.isConditionValid=function(){return a.params&&a.condition?a.params[a.prod]&&a.params[a.prod][a.param]&&["gt","lt","eq","ge","le"].indexOf(a.relation)>-1&&"number"==typeof a.value:!1},a.$watchGroup(["prod","param","relation","value"],function(){a.isConditionValid()?a.condition.construct=[a.prod,a.param,a.relation,a.value].join(":"):a.condition.construct=""})}}}),angular.module("dscovrDataApp").controller("VisTsCtrl",["$scope","$timeout","$cookieStore","dscovrDataAccess","$routeParams","$location","$rootScope",function(a,b,c,d,e,f,g){a.can_plot=!1,a.timerange_ready=!1,a.$on("timerangeReady",function(){a.timerange_ready=!0}),a.error="",a.info="";var h=function(b){a.error+=b+"\n"},i=function(b){a.info+=b+"\n"},j=function(b){i("evaluating request"),a.$broadcast("evalTimerange",function(c){return console.log("got time range: "+c),a.timerange=c,a.timerange[0]&&a.timerange[1]?a.timerange[0]>=a.timerange[1]?(h("end date is not after start date"),void(a.can_plot=!1)):(a.pane_strs="",void a.$broadcast("evalNumPanes",function(c){console.log("evalPanes expecting # panes: "+c);var d=0;a.$broadcast("evalParameters",function(e){e&&(++d,a.pane_strs+=(a.pane_strs?";;":"")+e),d==c&&(console.log("evalPanes received all responses"),a.pane_strs?(a.can_plot=!0,a.$broadcast("evalConditions",function(c){a.condition_str=c,b&&b()})):h("please enter at least 1 valid pane"))})})):(h("no time range selected"),void(a.can_plot=!1))})},k=function(){a.plots=[];var b,c=a.timerange.slice(),e=a.condition_str;a.pane_strs.split(";;").map(function(f,g){if(f){console.log("processing panel: "+(g+1)+" : "+f);var j,k="linear",l=[],m=f.split("*");if(b=m[0],!b)return void h("panel "+(g+1)+": nothing to do");m[1]&&(k="log"==m[1]?"log":"linear"),";"==b.charAt(b.length-1)&&(b=b.slice(0,-1)),j=b.split(";").map(function(b){var c=b.split(":");return l.push(c[1]+(a.params[c[0]][c[1]]?" ["+a.params[c[0]][c[1]]+"]":"")),c[1]}),l.join(", "),i("panel "+(g+1)+": requesting data"),d.getValues3(b,c,e).then(function(d){i("panel "+(g+1)+": data received, parsing");var e=j.map(function(a){return{x:[],y:[],mode:"markers",marker:{symbol:"circle",size:3},name:a,line:{width:1}}}),f=[];if(d.map(function(a){f.push(new Date(a.time)),j.map(function(b,c){"-9999"==a[b]|"-999"==a[b]?e[c].y.push(null):e[c].y.push(+a[b])})}),e.map(function(a){a.x=f}),f.length>1){i("panel "+(g+1)+": plot will appear below");b+" from "+c.map(Date).join(" to ");a.plots[g]={traces:e,layout:{title:j.join(", ")+" vs time",xaxis:{title:"time",showline:!0},yaxis:{title:l,type:k,showline:!0},margin:{t:80}}}}else h("Panel "+(g+1)+": no data matching request")},function(a){h("Panel "+(g+1)+": "+a)})}})};if(a.go=function(){j(function(){var b="/vis/ts/"+a.pane_strs+"/"+a.timerange.join(":")+"/"+a.condition_str;f.url()!=b?(c.put("vis.arg",a.pane_strs),c.put("vis.argg",a.timerange.join(":")),c.put("vis.arggg",a.condition_str),a.can_plot&&f.url(b)):h("request unchanged and aready fulfilled")})},d.getParameters2().then(function(a){g.params=a},h),d.getProducts2().then(function(a){g.prods=a},h),e.arg?a.predef_param=e.arg:c.get("vis.arg")&&(a.predef_param=c.get("vis.arg")),e.argg?a.predef_time=e.argg.split(":").map(Number):c.get("vis.argg")&&(a.predef_time=c.get("vis.argg").split(":").map(Number)),e.arggg?a.predef_cond=e.arggg:c.get("vis.arggg")&&(a.predef_cond=c.get("vis.arggg")),e.arg&&e.argg){var l=function(){g.params&&a.timerange_ready?j(k):b(l,500)};l()}}]),angular.module("dscovrDataApp").controller("VisScatterCtrl",["$scope","$timeout","$cookieStore","dscovrDataAccess","$routeParams","$location","$rootScope",function(a,b,c,d,e,f,g){a.can_plot=!1,a.timerange_ready=!1,a.$on("timerangeReady",function(){a.timerange_ready=!0}),a.error="",a.info="",a.plot={};var h=function(b){a.error+=b+"\n"},i=function(b){a.info+=b+"\n"},j=function(b){i("evaluating request"),a.$broadcast("evalTimerange",function(c){return console.log("got time range: "+c),a.timerange=c,a.timerange[0]&&a.timerange[1]?a.timerange[0]>=a.timerange[1]?(h("end date is not after start date"),void(a.can_plot=!1)):void a.$broadcast("evalParameters",function(c){a.selection_str=c,a.selection_str?(a.can_plot=!0,a.$broadcast("evalConditions",function(c){a.condition_str=c,b&&b()})):h("Please select two variables to plot")}):(h("no time range selected"),void(a.can_plot=!1))})},k=function(){var b,c,e,f=a.selection_str,g=a.timerange.slice(),j=a.condition_str;b=f.split(";");var k=[];c=b[0].split("*");var e=c[0].split(":"),l="log"==c[1]?"log":"linear",m=e[0],n=e[1];k.push(c[0]),c=b[1].split("*"),e=c[0].split(":");var o="log"==c[1]?"log":"linear",p=e[0],q=e[1];k.push(c[0]);var r=n+(a.params[m][n]?" ["+a.params[m][n]+"]":""),s=q+(a.params[p][q]?" ["+a.params[p][q]+"]":"");i("requesting data"),d.getValues3(k.join(";"),g,j).then(function(b){i("data received, parsing");var c={x:[],y:[],marker:{size:5,color:[],autocolorscale:!1,colorscale:!0,colorbar:{title:"date",tickmode:"array",tickvals:[],ticktext:[]}},mode:"markers",type:"scatter",hoverinfo:"x+y"},d=Math.floor(b.length/3);b.map(function(a,b){(b+Math.floor(d/1.7))%d==0&&(c.marker.colorbar.tickvals.push(a.time),c.marker.colorbar.ticktext.push(moment(a.time).format("YYYY-MM-DD HH:MM"))),"-9999"==a[n]|"-999"==a[n]|"-9999"==a[q]|"-999"==a[q]||(c.marker.color.push(a.time),c.x.push(a[n]),c.y.push(a[q]))}),c.x.length>0?(i("plot will appear below"),a.plot={traces:[c],layout:{autosize:!0,title:q+" vs "+n,hovermode:"closest",xaxis:{title:r,type:l,showline:!0},yaxis:{title:s,type:o,showline:!0}},makesquare:!0,download_link:{timerange:g,params:p==m?m:m+";"+p}}):h("no data matching request")},h)};if(a.go=function(){j(function(){var b="/vis/scatter/"+a.selection_str+"/"+a.timerange.join(":")+"/"+a.condition_str;f.url()!=b?(c.put("scatter.arg",a.selection_str),c.put("scatter.argg",a.timerange.join(":")),c.put("scatter.arggg",a.condition_str),a.can_plot&&f.url(b)):h("request unchanged and aready fulfilled")})},d.getParameters2().then(function(a){g.params=a},h),d.getProducts2().then(function(a){g.prods=a},h),e.arg?a.predef_selec=e.arg:c.get("scatter.arg")&&(a.predef_selec=c.get("scatter.arg")),e.argg?a.predef_time=e.argg.split(":").map(Number):c.get("scatter.argg")&&(a.predef_time=c.get("scatter.argg").split(":").map(Number)),e.arggg?a.predef_cond=e.arggg:c.get("scatter.arggg")&&(a.predef_cond=c.get("scatter.arggg")),e.arg&&e.argg){var l=function(){a.params&&a.timerange_ready?j(k):b(l,500)};l()}}]),angular.module("dscovrDataApp").directive("tsParamContainer",function(){return{template:'<div class="row ts-param-pane" ng-repeat="pane in panes"><div ts-param-pane pane="pane" removable="panes.length > 1" rm-pane="rmPane($index)" position="$index+1"></div></div><div class="ts-param-pane-add-pane" class="col-xs-2"><a class="btn btn-default" ng-click=addPane()> + panel </a></div>',restrict:"A",scope:{predef:"="},link:function(a){a.panes=[{}];var b=a.$watch("predef",function(){a.predef&&(console.log("passing on predef: "+a.predef),a.panes=a.predef.split(";;").map(function(a){return{predef:a}}),b())});a.addPane=function(){a.panes.push({})},a.rmPane=function(b){a.panes.length>1&&a.panes.splice(b,1)},a.$on("evalNumPanes",function(b,c){c(a.panes.length)})}}}),angular.module("dscovrDataApp").directive("timeRange",["dscovrUtil",function(a){return{template:'<div class="row no-padding-right" style="margin-bottom: 15px; clear: both"><div class="col-xs-12 no-padding-right"><h5>Begin Date</h5><quick-datepicker ng-model="selected_begin" on-change="onchange_begin()" time-format="HH:mm" icon-class="glyphicon glyphicon-calendar" disable-clear-button="true"></quick-datepicker></div><div class="col-xs-12 no-padding-right"><h5>End Date</h5><quick-datepicker ng-model="selected_end" on-change="onchange_end()" time-format="HH:mm" icon-class="glyphicon glyphicon-calendar" disable-clear-button="true"></quick-datepicker></div></div>',restrict:"A",scope:{predef:"="},link:function(b){b.selected_begin=moment(14389272e5).toDate(),b.selected_end=moment(14400504e5).toDate(),b.time_difference=b.selected_end.getTime()-b.selected_begin.getTime(),b.$on("evalTimerange",function(a,c){c(b.evalTimerange())});var c=b.$watch("predef",function(){b.predef&&(b.selected_begin=new Date(+b.predef[0]),b.selected_end=new Date(+b.predef[1]),c())});b.evalTimerange=function(){return[b.selected_begin.getTime(),b.selected_end.getTime()]},b.onchange_begin=function(){if(moment(b.selected_begin).isSameOrAfter(b.selected_end)){var c=moment(b.selected_begin).add(b.time_difference,"ms");a.getMissionEnd().isSameOrAfter(c)?b.selected_end=c.toDate():b.selected_end=a.getMissionEnd().toDate()}else b.time_difference=b.selected_end.getTime()-b.selected_begin.getTime()},b.onchange_end=function(){if(moment(b.selected_end).isSameOrBefore(b.selected_begin)){var c=moment(b.selected_end).subtract(b.time_difference,"ms");a.getMissionBegin().isSameOrBefore(c)?b.selected_begin=c.toDate():b.selected_begin=a.getMissionBegin().toDate()}else b.time_difference=b.selected_end.getTime()-b.selected_begin.getTime()},b.$emit("timerangeReady")}}}]),angular.module("dscovrDataApp").directive("tsParamPane",function(){return{template:'<div class="col-xs-12"><div class="row margin-b10"><div class="col-xs-3 ts-param-pane-panel-title"><h4 class="ts-param-pane-panel-title"> Panel {{position}}</h4></div><div class="ts-param-pane-remove-pane" class="col-xs-2"><a ng-if="removable" class="btn btn-default btn-sm" ng-click=rmPane($index)><span class="glyphicon glyphicon-remove"> </span></a></div></div><div class="row pane-edit" ng-repeat="selection in selections track by $index"><div param-edit selection="selection" removable="selections.length > 1" rm-selection="rmSelection($index)"></div></div><form class="col-xs-5"><div class="checkbox"><label><input type="checkbox" ng-model="adv.log">Log scale</label></div></form><div class="col-xs-4 col-xs-offset-1"><a class="btn btn-default btn-sm" ng-click=addSelection()> + variable </a></div></div>',restrict:"A",scope:{pane:"=",removable:"=",rmPane:"&",position:"="},link:function(a){a.selections=[{}],a.adv={log:!1};var b=a.$watch("pane.predef",function(){if(a.pane&&a.pane.predef){var c=a.pane.predef.split("*");if(!c[0])return;if(c[1]){var d=c[1];";"===d.charAt(d.length-1)&&(d=d.slice(0,-1)),a.adv.log="log"===d}a.selections=[],c[0].split(";").map(function(b){a.selections.push({predef:b})}),b()}});a.addSelection=function(){a.selections.push({})},a.rmSelection=function(b){a.selections.length>1&&a.selections.splice(b,1)},a.getOrCreateConstruct=function(a){return a.construct?a.construct:a.prod&&a.param?a.prod+":"+a.param:""},a.evalParameters=function(){var b="";for(var c in a.selections)b+=(b?";":"")+a.getOrCreateConstruct(a.selections[c]);return a.adv.log&&(b+="*log"),b},a.$on("evalParameters",function(b,c){c(a.evalParameters())})}}}),angular.module("dscovrDataApp").directive("paramEdit",function(){return{template:'<div ng-class="{\'col-xs-11\' : removable, \'col-xs-12\' : !removable}" class="no-padding-left no-padding-right"><select class="form-control param-edit-select-prod" ng-model="prod" title={{prodTitle(prod)}}><option value="" disabled selected>-product-</option><option ng-repeat="prod in keys(params)" title="{{prodTitle(prod)}}">{{prod}}</option></select><select class="form-control param-edit-select-var" ng-model="param" ng-options="param for param in keys(params[prod])"><option value="" disabled selected>-variable-</option></select></div><div class="col-xs-1 no-padding-left no-padding-right" ng-if="removable"><a class="btn btn-default" ng-click=rmSelection()><span class="glyphicon glyphicon-remove"></span></a></div>',restrict:"A",scope:{selection:"=",removable:"=",rmSelection:"&"},link:function(a){var b=a.$watch("$root.params",function(){if(a.$root.params){a.params=a.$root.params;var c=a.$watch("selection.predef",function(){if(a.selection&&a.selection.predef){var b=a.selection.predef.split(":");a.prod=b[0],a.param=b[1],c()}});b()}}),c=a.$watch("$root.prods",function(){a.$root.prods&&(a.prods=a.$root.prods,c())});a.$watchGroup(["prod","param"],function(){a.param&&a.prod?a.selection.construct=[a.prod,a.param].join(":"):a.selection.construct=""}),a.keys=function(a){return a?Object.keys(a):void 0},a.prodTitle=function(b){if(a.prods){var c=a.prods.findIndex(function(a){return a.product===b});if(c>=0)return a.prods[c].title}}}}}),angular.module("dscovrDataApp").directive("scatterParamPane",function(){return{template:'<div class="row paneEdit"><div class="col-xs-3 no-padding-right"><h4> x-axis: </h4></div><div class="col-xs-9 no-padding-left no-padding-right"><div param-edit selection="selection_x" removable="false"></div></div><form class="col-xs-5 col-xs-offset-3 clear"><div class="checkbox"><label><input type="checkbox" ng-model="selection_x.log">Log x scale</label></div></form></div><div class="row paneEdit"><div class="col-xs-3 no-padding-right"><h4> y-axis: </h4></div><div class="col-xs-9 no-padding-left no-padding-right"><div param-edit selection="selection_y" removable="false"></div></div><form class="col-xs-5 col-xs-offset-3 clear"><div class="checkbox"><label><input type="checkbox" ng-model="selection_y.log">Log y scale</label></div></form></div>',restrict:"A",scope:{predef:"="},link:function(a){a.selection_y={},a.selection_x={};var b=a.$watch("predef",function(){if(a.predef){var c,d=a.predef.split(";");d[0]&&(c=d[0].split("*"),a.selection_x.log="log"===c[1],a.selection_x.predef=c[0]),d[1]&&(c=d[1].split("*"),a.selection_y.log="log"===c[1],a.selection_y.predef=c[0]),b()}});a.getOrCreateConstruct=function(a){return a.construct?a.construct+(a.log?"*log":""):a.prod&&a.param?a.prod+":"+a.param+(a.log?"*log":""):""},a.evalParameters=function(){var b=a.getOrCreateConstruct(a.selection_x),c=a.getOrCreateConstruct(a.selection_y);return b&&c?[b,c].join(";"):""},a.$on("evalParameters",function(b,c){c(a.evalParameters())})}}}),angular.module("dscovrDataApp").factory("dscovrDataAccess",["$http","$q","$timeout",function(a,b,c){var d="//gis.ngdc.noaa.gov/dscovr-data-access/",e=function(d){function e(){a.get(d).success(function(a){g.resolve(a)}).error(function(a){3>f?(f++,c(e,500)):a?g.reject(a.error+" ("+a.status+") : "+a.message):g.reject("could not contact data server, please try again later")})}console.log(d);var f=0,g=b.defer();return e(),g.promise};return{getProducts:function(){return a.get(d+"products").then(function(a){return"object"==typeof a.data?a.data:b.reject(a.data)},function(a){return b.reject(a.data)})},getProducts2:function(){var a=d+"products";return e(a)},getParameters:function(){return a.get(d+"parameters").then(function(a){return"object"==typeof a.data?a.data:b.reject(a.data)},function(a){return b.reject(a.data)})},getParameters2:function(){var a=d+"parameters";return e(a)},getValues:function(c,e){var f=d+"values?parameters="+c+"&criteria="+e;return console.log(f),a.get(f).then(function(a){return"object"==typeof a.data?a.data:b.reject(a.data)},function(a){return b.reject(a.data)})},getValues2:function(c,e){function f(){a.get(g).success(function(a){a.length<1?i.reject("no data matching request"):i.resolve(a)}).error(function(a){3>h?(h++,f()):i.reject(a.error+" ("+a.status+") : "+a.message)})}var g=d+"values?parameters="+c+"&criteria="+e;console.log(g);var h=0,i=b.defer();return f(),i.promise},getValues3:function(c,e,f){function g(){a.get(i).success(function(a){a.length<1?k.reject("no data matching request"):k.resolve(a)}).error(function(a){3>j?(j++,g()):a?k.reject(a.error+" ("+a.status+") : "+a.message):k.reject("could not contact data server, please try again later")})}var h="m1m:time:ge:"+e[0]+";m1m:time:le:"+e[1]+";",i=d+"values?parameters="+c+"&criteria="+h+f;console.log(i);var j=0,k=b.defer();return g(),k.promise},getFiles:function(c,e){var f=d+"files?start_date="+c+"&end_date="+e;return a.get(f).then(function(a){return"object"==typeof a.data?a.data:b.reject(a.data)},function(a){return b.reject(a.data)})},getFiles2:function(a,b){var c=d+"files?start_date="+a+"&end_date="+b;return e(c)}}}]),angular.module("dscovrDataApp").directive("downloadTimeRange",["dscovrUtil",function(a){return{template:'<div class="row" style="margin-bottom: 15px;"><div class="col-xs-4"><h5>Begin Date</h5><quick-datepicker ng-model="selected_begin" on-change="onchange_begin()" disable-timepicker="true" icon-class="glyphicon glyphicon-calendar"></quick-datepicker></div><div class="col-xs-6" style="padding:0;margin:0;"><h5>End Date</h5><quick-datepicker ng-model="selected_end" on-change="onchange_end()" disable-timepicker="true" icon-class="glyphicon glyphicon-calendar"></quick-datepicker></div></div>',restrict:"A",scope:{predef:"="},link:function(b){var c=b.$watch("predef",function(){b.predef&&(b.selected_begin=new Date(+b.predef[0]),b.selected_end=new Date(+b.predef[1]),c())});b.onchange_common=function(){b.$emit("datechange",[b.selected_begin.getTime(),b.selected_end.getTime()])},b.onchange_begin=function(){if(moment(b.selected_begin).isSameOrAfter(b.selected_end)){var c=moment(b.selected_begin).add(b.time_difference,"ms");a.getMissionEnd().isSameOrAfter(c)?b.selected_end=c.toDate():b.selected_end=a.getMissionEnd().toDate()}else b.time_difference=b.selected_end.getTime()-b.selected_begin.getTime();b.onchange_common()},b.onchange_end=function(){if(moment(b.selected_end).isSameOrBefore(b.selected_begin)){var c=moment(b.selected_end).subtract(b.time_difference,"ms");a.getMissionBegin().isSameOrBefore(c)?b.selected_begin=c.toDate():b.selected_begin=a.getMissionBegin().toDate()}else b.time_difference=b.selected_end.getTime()-b.selected_begin.getTime();b.onchange_common()},b.selected_begin=moment(14389272e5).toDate(),b.selected_end=moment(b.selected_begin).add(10,"days").toDate(),b.time_difference=b.selected_end.getTime()-b.selected_begin.getTime(),b.onchange_common()}}}]),angular.module("dscovrDataApp").factory("dscovrUtil",function(){var a=moment.utc("02-03-2015","DD-MM-YYYY"),b=moment.utc().subtract(1,"days").startOf("day");return{dateInRange:function(c){return c&&moment.utc(+c).isBetween(a,b)},getMissionBegin:function(){return a},getMissionEnd:function(){return b}}}),angular.module("dscovrDataApp").directive("statusLog",function(){return{template:'<p style="white-space: pre-line;" class="status-log-box" >{{text}}</p>',restrict:"A",scope:{text:"="},link:function(a,b){a.$watch("text",function(a){a&&$(b).children().scrollTop(1e5)})}}}),angular.module("dscovrDataApp").directive("plotlyPlot",function(){return{template:"",restrict:"A",scope:{plot:"="},link:function(a,b){var c=a.$watch("plot",function(){a.plot&&a.plot.traces&&(c(),a.plot.makesquare&&a.plot.layout&&(a.plot.layout.width=b[0].clientWidth,a.plot.layout.height=.7*b[0].clientWidth),Plotly.newPlot(b[0],a.plot.traces,a.plot.layout||{},{editable:!0,displaylogo:!1,showLink:!1,modeBarButtonsToRemove:["sendDataToCloud","lasso2d"]}),a.plot.dark&&($(".js-plotly-plot .plotly .modebar-btn path").css("fill","white"),$(".js-plotly-plot .plotly .modebar").css("background-color","black")))})}}}),angular.module("dscovrDataApp").directive("tooltipHelp",function(){return{template:'<span data-toggle="tooltip" class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>',restrict:"A",scope:{},link:function(a,b,c){$(b[0].firstChild).tooltip({title:c.hover,placement:c.placement||"left",html:!0})}}}),angular.module("dscovrDataApp").controller("VisColorTsCtrl",["$scope","$timeout","$cookieStore","dscovrDataAccess","$routeParams","$location","$rootScope","$route",function(a,b,c,d,e,f,g,h){a.$on("$viewContentLoaded",function(){$(".header").addClass("hidden"),$(".foot").addClass("hidden"),$("*").css("background-color","black"),$("*").css("color","white"),$(".ts-param-pane-add-pane").css("box-shadow","none")}),a.can_plot=!1,a.timerange_ready=!1,a.$on("timerangeReady",function(){a.timerange_ready=!0}),a.error="",a.info="";var i=function(b){a.error+=b+"\n"},j=function(b){a.info+=b+"\n"},k=function(b){j("evaluating request"),a.$broadcast("evalTimerange",function(c){return console.log("got time range: "+c),a.timerange=c,a.timerange[0]&&a.timerange[1]?a.timerange[0]>=a.timerange[1]?(i("end date is not after start date"),void(a.can_plot=!1)):(a.pane_strs="",void a.$broadcast("evalNumPanes",function(c){console.log("evalPanes expecting # panes: "+c);var d=0;a.$broadcast("evalParameters",function(e){e&&(++d,a.pane_strs+=(a.pane_strs?";;":"")+e),d==c&&(console.log("evalPanes received all responses"),a.pane_strs?(a.can_plot=!0,a.$broadcast("evalConditions",function(c){a.condition_str=c,b&&b()})):i("please enter at least 1 valid pane"))})})):(i("no time range selected"),void(a.can_plot=!1))})},l=function(){a.plots=[];var b,c=a.timerange.slice(),e=a.condition_str;a.pane_strs.split(";;").map(function(f,g){if(f){console.log("processing panel: "+(g+1)+" : "+f);var h,k="linear",l=[],m=[],n=f.split("*");if(b=n[0].split(";").map(function(a){var b=a.split(":");return m.push("#"+b[2]),b.slice(0,2).join(":")}).join(";"),!b)return void i("panel "+(g+1)+": nothing to do");n[1]&&(k="log"==n[1]?"log":"linear"),";"==b.charAt(b.length-1)&&(b=b.slice(0,-1)),h=b.split(";").map(function(b){var c=b.split(":");return l.push(c[1]+(a.params[c[0]][c[1]]?" ["+a.params[c[0]][c[1]]+"]":"")),c[1]}),l.join(", "),j("panel "+(g+1)+": requesting data"),d.getValues3(b,c,e).then(function(d){j("panel "+(g+1)+": data received, parsing");var e=h.map(function(a,b){return{x:[],y:[],mode:"markers",marker:{color:m[b],symbol:"circle",size:3},name:a,line:{width:1}}}),f=[];if(d.map(function(a){f.push(new Date(a.time)),h.map(function(b,c){"-9999"==a[b]|"-999"==a[b]?e[c].y.push(null):e[c].y.push(+a[b])})}),e.map(function(a){a.x=f}),f.length>1){j("panel "+(g+1)+": plot will appear below");b+" from "+c.map(Date).join(" to ");a.plots[g]={traces:e,layout:{paper_bgcolor:"#000000",plot_bgcolor:"#000000",title:h.join(", ")+" vs time",font:{color:"#FFFFFF"},xaxis:{title:"time",showline:!0,titlefont:{color:"#FFFFFF"},tickfont:{color:"#FFFFFF"}},yaxis:{title:l,type:k,showline:!0,titlefont:{color:"#FFFFFF"},tickfont:{color:"#FFFFFF"}},margin:{t:80}},dark:!0}}else i("Panel "+(g+1)+": no data matching request")},function(a){i("Panel "+(g+1)+": "+a)})}})};if(a.go=function(){k(function(){var b="/vis/color/ts/"+a.pane_strs+"/"+a.timerange.join(":")+"/"+a.condition_str;f.url()!=b?(c.put("cvis.arg",a.pane_strs),c.put("cvis.argg",a.timerange.join(":")),c.put("cvis.arggg",a.condition_str),a.can_plot&&f.url(b)):i("request unchanged and aready fulfilled")})},d.getParameters2().then(function(a){g.params=a},i),d.getProducts2().then(function(a){g.prods=a},i),e.arg?a.predef_param=e.arg:c.get("cvis.arg")&&(a.predef_param=c.get("cvis.arg")),e.argg?a.predef_time=e.argg.split(":").map(Number):c.get("cvis.argg")&&(a.predef_time=c.get("cvis.argg").split(":").map(Number)),e.arggg?a.predef_cond=e.arggg:c.get("cvis.arggg")&&(a.predef_cond=c.get("cvis.arggg")),e.arg&&e.argg){var m=function(){g.params&&a.timerange_ready?k(l):b(m,500)};m()}a.$on("$locationChangeSuccess",function(){"VisColorTsCtrl"!==h.current.$$route.controller&&($(".header").removeClass("hidden"),$(".foot").removeClass("hidden"),$("*").attr("style",""))})}]),angular.module("dscovrDataApp").directive("colorTsParamContainer",function(){return{template:'<div class="row ts-param-pane" ng-repeat="pane in panes"><div color-ts-param-pane predef="pane" removable="panes.length > 1" rm-pane="rmPane($index)" position="$index+1"></div></div><div class="ts-param-pane-add-pane" class="col-xs-2" style="background-color: #000; color: #FFF"><a class="btn btn-default" ng-click=addPane()> + panel </a></div>',restrict:"A",scope:{predef:"="},link:function(a){a.panes=[{}];var b=a.$watch("predef",function(){a.predef&&(console.log("passing on predef: "+a.predef),a.panes=a.predef.split(";;").map(function(a){return{predef:a}}),b())});a.addPane=function(){a.panes.push({})},a.rmPane=function(b){console.log("rmPane: "+b),a.panes.length>1&&a.panes.splice(b,1)},a.$on("evalNumPanes",function(b,c){c(a.panes.length)})}}}),angular.module("dscovrDataApp").directive("colorTsParamPane",function(){
return{template:'<div class="col-xs-12"><div class="row margin-b10"><div class="col-xs-3 ts-param-pane-panel-title"><h4 class="ts-param-pane-panel-title"> Panel {{position}}</h4></div><div class="ts-param-pane-remove-pane" class="col-xs-2"><a ng-if="removable" class="btn btn-default btn-sm" ng-click=rmPane() style="background-color: #000; color: #FFF"><span class="glyphicon glyphicon-remove"> </span></a></div></div><div class="row pane-edit" ng-repeat="selection in selections track by $index"><div color-param-edit selection="selection" removable="selections.length > 1" rm-selection="rmSelection($index)"></div></div><form class="col-xs-5"><div class="checkbox"><label><input type="checkbox" ng-model="adv.log">Log scale</label></div></form><div class="col-xs-4 col-xs-offset-1"><a class="btn btn-default btn-sm" ng-click=addSelection() style="background-color: #000; color: #FFF"> + variable </a></div></div>',restrict:"A",scope:{pane:"=",removable:"=",rmPane:"&",position:"="},link:function(a){a.selections=[{predef:"::"+Math.round(Math.random()*(1<<24)).toString(16)}],a.adv={log:!1};var b=a.$watch("pane.predef",function(){if(a.pane&&a.pane.predef){var c=a.pane.predef.split("*");if(!c[0])return;if(c[1]){var d=c[1];";"===d.charAt(d.length-1)&&(d=d.slice(0,-1)),a.adv.log="log"===d}a.selections=[],c[0].split(";").map(function(b){a.selections.push({predef:b})}),b()}});a.addSelection=function(){a.selections.push({predef:"::"+Math.round(Math.random()*(1<<24)).toString(16)})},a.rmSelection=function(b){a.selections.length>1&&a.selections.splice(b,1)},a.getOrCreateConstruct=function(a){return a.construct?a.construct:a.prod&&a.param?a.prod+":"+a.param:""},a.evalParameters=function(){var b="";for(var c in a.selections)b+=(b?";":"")+a.getOrCreateConstruct(a.selections[c]);return a.adv.log&&(b+="*log"),b},a.$on("evalParameters",function(b,c){c(a.evalParameters())})}}}),angular.module("dscovrDataApp").directive("colorParamEdit",function(){return{template:'<div ng-class="{\'col-xs-11\' : removable, \'col-xs-12\' : !removable}" class="no-padding-left no-padding-right"><select class="form-control param-edit-select-prod" ng-model="prod" title={{prodTitle(prod)}} style="background-color: #000; color: #FFF"><option value="" disabled selected>-product-</option><option ng-repeat="prod in keys(params)" title="{{prodTitle(prod)}}">{{prod}}</option></select><select class="form-control param-edit-select-prod" ng-model="param" ng-options="param for param in keys(params[prod])" style="background-color: #000; color: #FFF"><option value="" disabled selected>-variable-</option></select><input class="form-control param-edit-select-color" type="color" ng-model="color" style="background-color: #000; color: #FFF"></input></div><div class="col-xs-1 no-padding-left no-padding-right" ng-if="removable"><a class="btn btn-default" ng-click=rmSelection() style="background-color: #000; color: #FFF"><span class="glyphicon glyphicon-remove"></span></a></div>',restrict:"A",scope:{selection:"=",removable:"=",rmSelection:"&"},link:function(a){var b=a.$watch("$root.params",function(){if(a.$root.params){a.params=a.$root.params;var c=a.$watch("selection.predef",function(){if(a.selection&&a.selection.predef){var b=a.selection.predef.split(":");a.prod=b[0],a.param=b[1],a.color="#"+b[2],c()}});b()}}),c=a.$watch("$root.prods",function(){a.$root.prods&&(a.prods=a.$root.prods,c())});a.$watchGroup(["prod","param","color"],function(){a.param&&a.prod?a.selection.construct=[a.prod,a.param,a.color.substr(1)].join(":"):a.selection.construct=""}),a.keys=function(a){return a?Object.keys(a):void 0},a.prodTitle=function(b){if(a.prods){var c=a.prods.findIndex(function(a){return a.product===b});if(c>=0)return a.prods[c].title}}}}});