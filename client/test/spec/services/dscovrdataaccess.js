'use strict';

describe('Service: dscovrDataAccess', function () {

  // load the service's module
  beforeEach(module('dscovrDataApp'));

  // instantiate service
  var dscovrDataAccess;
  beforeEach(inject(function (_dscovrDataAccess_) {
    dscovrDataAccess = _dscovrDataAccess_;
  }));

  it('should do something', function () {
    expect(!!dscovrDataAccess).toBe(true);
  });

});
