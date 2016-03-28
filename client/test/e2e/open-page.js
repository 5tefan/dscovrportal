describe("open the home page", function() {
	browser.driver.manage().window().setSize(1200, 100);

	it('should open the pages', function() {
		browser.get('/');
		element(by.partialLinkText('Visualize Data')).click();
		expect(browser.getCurrentUrl()).toContain("vis");
		element(by.partialLinkText('Download Data')).click();
		expect(browser.getCurrentUrl()).toContain("download");
	});
});
