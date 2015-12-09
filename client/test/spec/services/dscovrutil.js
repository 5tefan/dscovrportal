'use strict';

describe('Service: dscovrUtil', function () {

  // load the service's module
  beforeEach(module('dscovrDataApp'));

  // instantiate service
  var dscovrUtil;
  beforeEach(inject(function (_dscovrUtil_) {
    dscovrUtil = _dscovrUtil_;
  }));

  it('should do something', function () {
    expect(!!dscovrUtil).toBe(true);
  });

});
