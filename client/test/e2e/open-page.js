describe("open the home page", function() {
	it('should open the pages', function() {
		browser.get('/');
		element(by.partialLinkText('Visualize Data')).click();
		expect(browser.getCurrentUrl()).toContain("vis");
		element(by.partialLinkText('Download Data')).click();
		expect(browser.getCurrentUrl()).toContain("download");
	});
});
