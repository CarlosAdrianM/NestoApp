import { tokenNotExpired } from 'angular2-jwt';
var AuthService = (function () {
    function AuthService() {
    }
    AuthService.prototype.authenticated = function () {
        return tokenNotExpired();
    };
    return AuthService;
}());
export { AuthService };
//# sourceMappingURL=auth.js.map