import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Storage } from '@ionic/storage';
import { Observable, from, of, throwError } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { Configuracion } from '../../components/configuracion/configuracion/configuracion.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private jwtHelper = new JwtHelperService();
  private refreshTokenInProgress = false;
  private refreshTokenSubject: Observable<string> | null = null;

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) { }

  public authenticated(): any {
    return this.jwtHelper.isTokenExpired();
  }

  public isTokenExpired(token: string): boolean {
    return this.jwtHelper.isTokenExpired(token);
  }

  public async getValidToken(): Promise<string> {
    const token = await this.storage.get('id_token');
    if (!token) {
      throw new Error('No token available');
    }

    if (this.jwtHelper.isTokenExpired(token)) {
      return this.refreshToken().toPromise();
    }

    return token;
  }

  public refreshToken(): Observable<string> {
    if (this.refreshTokenInProgress && this.refreshTokenSubject) {
      return this.refreshTokenSubject;
    }

    this.refreshTokenInProgress = true;

    this.refreshTokenSubject = from(this.storage.get('id_token')).pipe(
      switchMap(token => {
        if (!token) {
          return throwError(() => new Error('No token available'));
        }

        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

        return this.http.post<{ token: string }>(
          Configuracion.API_URL + '/auth/refreshOAuthToken',
          {},
          { headers }
        );
      }),
      switchMap(response => {
        return from(this.storage.set('id_token', response.token)).pipe(
          switchMap(() => of(response.token))
        );
      }),
      tap(() => {
        this.refreshTokenInProgress = false;
        this.refreshTokenSubject = null;
      }),
      catchError(error => {
        this.refreshTokenInProgress = false;
        this.refreshTokenSubject = null;
        return throwError(() => error);
      })
    );

    return this.refreshTokenSubject;
  }
}
