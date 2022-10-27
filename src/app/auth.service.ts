import { Injectable } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { AuthenticationResult, EventMessage, EventType, InteractionType, NavigationClient, PublicClientApplication } from '@azure/msal-browser';
import { AlertsService } from './alerts.service';
import { OAuthSettings } from '../oauth';
import { User } from './user';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { filter } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})

export class AuthService {
  public authenticated: boolean;
  public user?: User;
  public graphClient?: Client;

  constructor(
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private alertsService: AlertsService,
    private iab: InAppBrowser
    ) {
  
    const accounts = this.msalService.instance.getAllAccounts();
    this.authenticated = accounts.length > 0;
    if (this.authenticated) {
      this.msalService.instance.setActiveAccount(accounts[0]);
    }
    this.getUser().then((user) => {this.user = user});
  }
  
  checkAndSetActiveAccount(){
    /**
     * If no active account set but there are accounts signed in, sets first account to active account
     * To use active account set here, subscribe to inProgress$ first in your component
     * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
     */
    /*
    let activeAccount = this.msalService.instance.getActiveAccount();

    if (!activeAccount && this.msalService.instance.getAllAccounts().length > 0) {
      let accounts = this.msalService.instance.getAllAccounts();
      this.msalService.instance.setActiveAccount(accounts[0]);
    }
    */
  }

  // Prompt the user to sign in and
  // grant consent to the requested permission scopes
  /*
  async signIn(): Promise<void> {
    const browser = this.iab.create('https://www.microsoft.com/');
    browser.executeScript({ code: "\
      const result = await this.msalService\
        .loginPopup(OAuthSettings)\
        .toPromise()\
        .catch((reason) => {\
          this.alertsService.addError('Login failed',\
            JSON.stringify(reason, null, 2));\
        });\
      if (result) {\
        this.msalService.instance.setActiveAccount(result.account);\
        this.authenticated = true;\
        this.user = await this.getUser();\
      }"
    }); 
  }
  */
  /*
  async signIn(): Promise<void> {
    const result = await this.msalService
      .loginPopup(OAuthSettings)
      .toPromise()
      .catch((reason) => {
        this.alertsService.addError('Login failed',
          JSON.stringify(reason, null, 2));
      });

    if (result) {
      this.msalService.instance.setActiveAccount(result.account);
      this.authenticated = true;
      this.user = await this.getUser();
    }
  }
  */

  /*
  async signIn(): Promise<void> {
    await this.msalService.instance.handleRedirectPromise();

    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length === 0) {
        // No user signed in
        this.msalService.instance.loginRedirect();
    }
  }
  */
  /*
  async signIn(): Promise<void> {
    // Versión de la respuesta de stackoverflow
    await this.msalService.instance.handleRedirectPromise().then((result) => {
      const accounts = this.msalService.instance.getAllAccounts();
      if (accounts.length === 0) {
          // No user signed in
          this.msalService.instance.loginRedirect();
      }
      
      if (result) {
        this.msalService.instance.setActiveAccount(result.account);
        this.authenticated = true;
        this.getUser().then((user) => {
          this.user = user;
        });
      }
      
    })
  */
  async signIn(): Promise<void> {
    const navigationClient = new CustomNavigationClient();
    this.msalService.instance.setNavigationClient(navigationClient);
    
    /*
    this.msalService.instance.handleRedirectPromise().then((authResult: any) => {
      console.debug('AuthResult ---->', authResult);
      if (authResult) { 
        this.msalService.instance.setActiveAccount(authResult.account);
        this.authenticated = true;
        this.getUser().then((user) => {
          this.user = user;
        });
      } else {
        this.msalService.instance.loginRedirect();
      }
    });
    */
    this.msalBroadcastService.msalSubject$
    //.pipe(
    //  filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
    //)
    .subscribe((result: EventMessage) => {
      console.log('--> login success 1: ', result);
      const payload = result.payload as AuthenticationResult;
      this.msalService.instance.setActiveAccount(payload.account);

      // custom service to handle authentication result within application
      /*
      this.azureAuthService.handleAuthentication(payload) 
        .pipe(
          tap(() => {
            console.log('--> login success 2: ');
            this.router.navigate(['/home']);
          })
        )
        .subscribe();
        */
    },
    (error) => {
      console.log("error");
    });
    

    /*
    const result = await this.msalService
      .loginPopup(OAuthSettings)
      .toPromise()
      .catch((reason) => {
        this.alertsService.addError('Login failed',
          JSON.stringify(reason, null, 2));
      });

    if (result) {
      this.msalService.instance.setActiveAccount(result.account);
      this.authenticated = true;
      this.user = await this.getUser();
    }
    */
  }   

  // Sign out
  async signOut(): Promise<void> {
    await this.msalService.logout().toPromise();
    this.user = undefined;
    this.authenticated = false;
  }

  private async getUser(): Promise<User | undefined> {
    if (!this.authenticated) return undefined;
  
    // Create an authentication provider for the current user
    const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(
      this.msalService.instance as PublicClientApplication,
      {
        account: this.msalService.instance.getActiveAccount()!,
        scopes: OAuthSettings.scopes,
        interactionType: InteractionType.Popup
      }
    );
  
    // Initialize the Graph client
    this.graphClient = Client.initWithMiddleware({
      authProvider: authProvider
    });
  
    // Get the user from Graph (GET /me)
    const graphUser: MicrosoftGraph.User = await this.graphClient
      .api('/me')
      .select('displayName,mail,mailboxSettings,userPrincipalName')
      .get();
  
    const user = new User();
    user.displayName = graphUser.displayName ?? '';
    // Prefer the mail property, but fall back to userPrincipalName
    user.email = graphUser.mail ?? graphUser.userPrincipalName ?? '';
    user.timeZone = graphUser.mailboxSettings?.timeZone ?? 'UTC';
  
    // Use default avatar
    user.avatar = '/assets/no-profile-photo.png';
  
    return user;
  }
}
declare let cordova: any;
class CustomNavigationClient extends NavigationClient {
  async navigateExternal(url: string, options: any) {
      // Cordova implementation
      if (window.hasOwnProperty("cordova")) {
          var ref = cordova.InAppBrowser.open(url, '_blank', 'location=yes,clearcache=yes,clearsessioncache=yes');

          // Check if the appbrowser started a navigation
          ref.addEventListener('loadstart', (event: any) => {
              // Check if the url contains the #state login parameter
              if (event.url.includes('#state')) {
                  // Close the in app browser and redirect to localhost + the state parameter
                  // msal-login is a fake route to trigger a page refresh
                  ref.close();
                  const domain = event.url.split('#')[0];
                  const url = event.url.replace(domain, 'http://localhost/msal-login');
                  window.location.href = url;
              }
          });
      } else {
          if (options.noHistory) {
              window.location.replace(url);
          } else {
              window.location.assign(url);
          }
      }
      return true;
  }
}
