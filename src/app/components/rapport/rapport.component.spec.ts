import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Usuario } from 'src/app/models/Usuario';
import { FirebaseAnalytics } from '@awesome-cordova-plugins/firebase-analytics/ngx';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';

import { RapportComponent } from './rapport.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('RapportComponent', () => {
  let component: RapportComponent;
  let fixture: ComponentFixture<RapportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [RapportComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot(), RouterTestingModule],
    providers: [
        Usuario,
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: { rapport: { Cliente: '0', Contacto: '', Id: 0, Tipo: '' } } } } },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        { provide: MsalService, useValue: { instance: { getAllAccounts: () => [] } } },
        { provide: MsalBroadcastService, useValue: { inProgress$: { pipe: () => ({ subscribe: () => { } }) } } },
        { provide: InAppBrowser, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(RapportComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
