"use strict";
var message = element(by.className('message'));
describe('Page2', function () {
    beforeEach(function () {
        browser.get('');
    });
    it('should have correct text when Goodbye Ionic is selected', function () {
        element(by.css('.bar-button-menutoggle')).click();
        element.all(by.css('ion-label')).last().click();
        expect(message.getText()).toEqual('Bye!');
    });
});
