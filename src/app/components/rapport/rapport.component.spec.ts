import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Usuario } from 'src/app/models/Usuario';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { RapportComponent } from './rapport.component';

describe('RapportComponent', () => {
  let component: RapportComponent;
  let fixture: ComponentFixture<RapportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RapportComponent ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
      providers: [
        Usuario,
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: { rapport: { Cliente: '0', Contacto: '', Id: 0, Tipo: '' } } } } },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => {} } },
        { provide: MsalService, useValue: { instance: { getAllAccounts: () => [] } } },
        { provide: MsalBroadcastService, useValue: { inProgress$: { pipe: () => ({ subscribe: () => {} }) } } },
        { provide: InAppBrowser, useValue: {} }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RapportComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
