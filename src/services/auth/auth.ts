import {tokenNotExpired} from 'angular2-jwt';

export class AuthService {
    
    public authenticated(): any {
        return tokenNotExpired();
    }
}
