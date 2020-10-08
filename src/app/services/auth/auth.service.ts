import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //constructor(public jwtHelper: JwtHelperService) { }
  private jwtHelper = new JwtHelperService();
  public authenticated(): any {
    return this.jwtHelper.isTokenExpired();
  }
}
