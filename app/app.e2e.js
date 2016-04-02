describe('NestoApp', function () {
    beforeEach(function () {
        browser.get('');
    });
    it('should have a title', function () {
        expect(browser.getTitle()).toEqual('Plantilla Venta');
    });
    it('should have <nav>', function () {
        expect(element(by.css('ion-navbar')).isPresent()).toEqual(true);
    });
    it('should have correct nav text for Home', function () {
        expect(element(by.css('ion-navbar:first-child')).getText()).toEqual('Plantilla Venta');
    });
    it('has a menu button that displays the left menu', function () {
        element(by.css('.bar-button-menutoggle')).click();
        expect(element.all(by.css('.toolbar-title')).first().getText()).toEqual('Menu');
    });
    it('the left menu has a link with title Extracto Cliente', function () {
        element(by.css('.bar-button-menutoggle')).click();
        expect(element.all(by.css('ion-label')).first().getText()).toEqual('Plantilla Venta');
    });
    it('the left menu has a link with title Goodbye Ionic', function () {
        element(by.css('.bar-button-menutoggle')).click();
        expect(element.all(by.css('ion-label')).last().getText()).toEqual('Goodbye Ionic');
    });
});
