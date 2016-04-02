describe('ExtractoCliente', function () {
    beforeEach(function () {
        browser.get('');
    });
    it('should switch into Extracto Cliente page from menu', function () {
        element(by.css('.bar-button-menutoggle')).click();
        element.all(by.cssContainingText('ion-label', 'Extracto Cliente')).first().click();
        expect(element.all(by.css('.toolbar-title')).last().getText()).toEqual('Extracto del Cliente');
    });
});
