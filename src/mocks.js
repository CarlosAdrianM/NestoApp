var ConfigMock = /** @class */ (function () {
    function ConfigMock() {
    }
    ConfigMock.prototype.get = function () {
        return '';
    };
    ConfigMock.prototype.getBoolean = function () {
        return true;
    };
    ConfigMock.prototype.getNumber = function () {
        return 1;
    };
    return ConfigMock;
}());
export { ConfigMock };
var FormMock = /** @class */ (function () {
    function FormMock() {
    }
    FormMock.prototype.register = function () {
        return true;
    };
    return FormMock;
}());
export { FormMock };
var NavMock = /** @class */ (function () {
    function NavMock() {
    }
    NavMock.prototype.pop = function () {
        return new Promise(function (resolve) {
            resolve();
        });
    };
    NavMock.prototype.push = function () {
        return new Promise(function (resolve) {
            resolve();
        });
    };
    NavMock.prototype.getActive = function () {
        return {
            'instance': {
                'model': 'something',
            },
        };
    };
    NavMock.prototype.setRoot = function () {
        return true;
    };
    return NavMock;
}());
export { NavMock };
var PlatformMock = /** @class */ (function () {
    function PlatformMock() {
    }
    PlatformMock.prototype.ready = function () {
        return new Promise(function (resolve) {
            resolve();
        });
    };
    return PlatformMock;
}());
export { PlatformMock };
var MenuMock = /** @class */ (function () {
    function MenuMock() {
    }
    MenuMock.prototype.close = function () {
        return new Promise(function (resolve) {
            resolve();
        });
    };
    return MenuMock;
}());
export { MenuMock };
//# sourceMappingURL=mocks.js.map