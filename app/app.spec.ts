import {
    TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS, TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS,
}                               from '@angular/platform-browser-dynamic/testing';
import { setBaseTestProviders } from '@angular/core/testing';
import { NestoApp }                                     from './app';
import { PlantillaVenta }                               from './pages/PlantillaVenta/PlantillaVenta';

setBaseTestProviders(TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS, TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS);

let nestoApp: NestoApp = null;

class MockClass {
    public ready(): any {
        return new Promise((resolve: Function) => {
            resolve();
        });
    }

    public close(): any {
        return true;
    }

    public setRoot(): any {
        return true;
    }
}

describe('NestoApp', () => {

    beforeEach(() => {
        let mockClass: any = (<any>new MockClass());
        nestoApp = new NestoApp(mockClass, mockClass, mockClass);
    });

    it('initialises with a root page', () => {
        expect(nestoApp['rootPage']).not.toBe(null);
    });

    it('initialises with an app', () => {
        expect(nestoApp['app']).not.toBe(null);
    });
/*
    it('opens a page', () => {
        spyOn(nestoApp['menu'], 'close');
        // cant be bothered to set up DOM testing for app.ts to get access to @ViewChild (Nav)
        nestoApp['nav'] = (<any>nestoApp['menu']);
        spyOn(nestoApp['nav'], 'setRoot');
        nestoApp.openPage(nestoApp['pages'][1]);
        expect(nestoApp['menu']['close']).toHaveBeenCalled();
        expect(nestoApp['nav'].setRoot).toHaveBeenCalledWith(PlantillaVenta);
    });
*/
});
