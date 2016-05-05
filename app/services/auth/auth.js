"use strict";
var angular2_jwt_1 = require('angular2-jwt');
var AuthService = (function () {
    function AuthService() {
    }
    AuthService.authenticated = function () {
        return angular2_jwt_1.tokenNotExpired();
    };
    return AuthService;
}());
exports.AuthService = AuthService;
