'use strict';

describe('Controller: VisCtrl', function () {

  // load the controller's module
  beforeEach(module('dscovrDataApp'));

  var VisCtrl,
    scope;

	var routeParams = {type: "summary", arg: "3d" };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    VisCtrl = $controller('VisCtrl', {
      $scope: scope,
	  $routeParams: routeParams,
    });
  }));

	it("should have 5 frame sizes in summary_frame_info", function() {
		expect( Object.keys(scope.summary_frame_info).length ).toBe(5)
	});

	it("should parse the same url date as it makes", function() {
		//test a date
		var testDate = moment();
		//turn it into a rul
		var urldate = scope.make_urldate(testDate);
		//turn it back, compare with original
		expect( scope.parse_urldate(urldate).toDate().getTime() )
			.toBe( testDate.toDate().getTime() );
	});

	it("should have datepicker functions defined", function() {
		//these guys are needed for the datepicker directive
		//used in the view
		expect( scope.dateselect_onchange ).toBeDefined();
		expect( scope.dateselect_locationchange ).toBeDefined();
		expect( scope.datepicker_open ).toBeDefined();
	});

	it("should have get_plotsrc and get_plotsrc_6h functions"), function() {
		//these functions are in charge of generating the src for
		//the canned plots
		expect( scope.get_plotsrc ).toBeDefined();
		expect( scope.get_plotsrc_6h ).toBeDefined();
	});

	it("should set selectmode to 0 if routeParams.type is summary", inject(function( $controller ) {
		var routeParams = { type: "summary" };
		var ctrl = $controller('VisCtrl', {
			$scope: scope,
			$routeParams: routeParams,
		});
		expect(scope.selectmode).toBe(0);
	}));

	it("should set selectmode to 1 if routeParams.type is interactive", inject(function( $controller ) {
		var routeParams = { type: "interactive" };
		var ctrl = $controller('VisCtrl', {
			$scope: scope,
			$routeParams: routeParams,
		});
		expect(scope.selectmode).toBe(1);
	}));


});
