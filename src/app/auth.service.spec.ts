import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: MsalService, useValue: { instance: { getAllAccounts: () => [] } } },
        { provide: MsalBroadcastService, useValue: {} },
        { provide: InAppBrowser, useValue: {} }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
