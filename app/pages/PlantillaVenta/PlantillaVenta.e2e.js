describe('PlantillaVenta', function () {
    beforeEach(function () {
        browser.get('');
    });
    it('debe poderse venir desde el menú', function () {
        element(by.css('.bar-button-menutoggle')).click();
        element.all(by.cssContainingText('ion-label', 'Plantilla Venta')).first().click();
        expect(element.all(by.css('.toolbar-title')).last().getText()).toEqual('Plantilla Venta');
    });
    it('debe tener slides para mostrar los diferentes pasos de la plantilla', function () {
        expect(element(by.tagName('ion-slides')).isPresent()).toBeTruthy();
    });
    it('debe tener un selector de clientes', function () {
        expect(element(by.tagName('selector-clientes')).isPresent()).toBeTruthy();
    });
    it('debe tener el slide para seleccionar productos', function () {
        expect(element(by.cssContainingText('ion-slides', 'Selección Productos')).isPresent()).toBeTruthy();
    });
    it('no se puede pasar al slide de seleccionar productos si no hay un cliente seleccionado', function () {
        expect(false).toBeTruthy();
    });
});
