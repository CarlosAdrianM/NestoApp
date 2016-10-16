import {tokenNotExpired} from 'angular2-jwt';

export class AuthService {
    

    public static authenticated(): any {
        return tokenNotExpired();
    }
}
