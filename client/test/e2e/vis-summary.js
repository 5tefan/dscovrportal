describe("the vis summary behavior", function() {
	it('should show 4 images under 6 hour plots', function() {
		browser.get('#/vis');
		element(by.partialLinkText('6 hour')).click();
		var parent_el = element(by.id('vis-plot'));
		expect(parent_el.all(by.tagName('img')).count()).toBe(4);
	});
	it('should show 1 image under 1, 3, 7 day and 1 month plots', function() {
		['1 day', '3 days', '7 days', '1 month'].map(function(type) {
			browser.get('#/vis');
			element(by.partialLinkText(type)).click();
			var parent_el = element(by.id('vis-plot'));
			expect(parent_el.all(by.tagName('img')).count()).toBe(1);
		});
	});
});
