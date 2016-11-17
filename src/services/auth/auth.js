import { tokenNotExpired } from 'angular2-jwt';
export var AuthService = (function () {
    function AuthService() {
    }
    AuthService.prototype.authenticated = function () {
        return tokenNotExpired();
    };
    return AuthService;
}());
//# sourceMappingURL=auth.js.map