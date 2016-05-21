"use strict";
var testing_1 = require('@angular/platform-browser-dynamic/testing');
var testing_2 = require('@angular/core/testing');
var ionic_angular_1 = require('ionic-angular');
var app_1 = require('./app');
var Usuario_1 = require('./models/Usuario');
// this needs doing _once_ for the entire test suite, hence it's here
testing_2.setBaseTestProviders(testing_1.TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS, testing_1.TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS);
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
            var usuario = new Usuario_1.Usuario();
            nestoApp = new app_1.NestoApp(ionicApp, platform, usuario);
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
