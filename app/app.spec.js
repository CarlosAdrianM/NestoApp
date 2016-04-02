var browser_1 = require('angular2/platform/testing/browser');
var testing_1 = require('angular2/testing');
var ionic_angular_1 = require('ionic-angular');
var app_1 = require('./app');
// this needs doing _once_ for the entire test suite, hence it's here
testing_1.setBaseTestProviders(browser_1.TEST_BROWSER_PLATFORM_PROVIDERS, browser_1.TEST_BROWSER_APPLICATION_PROVIDERS);
var nestoApp = null;
function getComponentStub(name) {
    'use strict';
    var component = {
        setRoot: function () { return true; },
        close: function (root) { return true; },
    };
    return component;
}
function main() {
    'use strict';
    describe('ClickerApp', function () {
        beforeEach(function () {
            var ionicApp = new ionic_angular_1.IonicApp(null, null, null);
            var platform = new ionic_angular_1.Platform();
            nestoApp = new app_1.NestoApp(ionicApp, platform);
        });
        it('initialises with three possible pages', function () {
            expect(nestoApp['pages'].length).toEqual(3);
        });
        it('initialises with a root page', function () {
            expect(nestoApp['rootPage']).not.toBe(null);
        });
        it('initialises with an app', function () {
            expect(nestoApp['app']).not.toBe(null);
        });
        it('opens a page', function () {
            spyOn(nestoApp['app'], 'getComponent').and.callFake(getComponentStub);
            nestoApp.openPage(nestoApp['pages'][1]);
            expect(nestoApp['app'].getComponent).toHaveBeenCalledWith('leftMenu');
            expect(nestoApp['app'].getComponent).toHaveBeenCalledWith('nav');
        });
    });
}
exports.main = main;
