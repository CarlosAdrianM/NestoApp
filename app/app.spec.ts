import { TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS} from 'angular2/platform/testing/browser';
import { setBaseTestProviders } from 'angular2/testing';
import { IonicApp, Platform }   from 'ionic-angular';
import { NestoApp }           from './app';
import {Usuario}                   from './models/Usuario';

// this needs doing _once_ for the entire test suite, hence it's here
setBaseTestProviders(TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS);

let nestoApp: NestoApp = null;

function getComponentStub(name: string): any {
  'use strict';

  let component: Object = {
    setRoot: function(): boolean { return true; },
    close: function(root: any): boolean { return true; },
  };
  return component;
}

export function main(): void {
  'use strict';

  describe('ClickerApp', () => {

    beforeEach(() => {
      let ionicApp: IonicApp = new IonicApp(null, null, null);
      let platform: Platform = new Platform();
      let usuario: Usuario = new Usuario();
      nestoApp = new NestoApp(ionicApp, platform, usuario);
    });

    it('initialises with three possible pages', () => {
      expect(nestoApp['pages'].length).toEqual(3);
    });

    it('initialises with a root page', () => {
      expect(nestoApp['rootPage']).not.toBe(null);
    });

    it('initialises with an app', () => {
      expect(nestoApp['app']).not.toBe(null);
    });

    it('opens a page', () => {
      spyOn(nestoApp['app'], 'getComponent').and.callFake(getComponentStub);
      nestoApp.openPage(nestoApp['pages'][1]);
      expect(nestoApp['app'].getComponent).toHaveBeenCalledWith('leftMenu');
      expect(nestoApp['app'].getComponent).toHaveBeenCalledWith('nav');
    });
  });
}
