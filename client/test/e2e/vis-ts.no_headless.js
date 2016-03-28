describe("the vis ts behavior", function() {
	it('should plot a basic time series plot with 1 panel', function() {
		browser.get("#/vis/ts/m1m:bt;m1m:bx_gse/1455624000000:1455696000000/");
		expect(element.all(by.partialLinkText("2/16/2016 05:00"))).not.toBeUndefined();
		expect(element.all(by.partialLinkText("2/17/2016 01:00"))).not.toBeUndefined();
		expect(element.all(by.repeater("plot in plots track by $index")).count()).toBe(1);
	});
});
