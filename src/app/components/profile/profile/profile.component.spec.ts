import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastController } from '@ionic/angular';
import { Usuario } from 'src/app/models/Usuario';
import { Storage } from '@ionic/storage-angular';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';
import { AppVersion } from 'src/app/services/app-version.service';
import { AppComponent } from 'src/app/app.component';

import { ProfileComponent } from './profile.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ProfileComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot(), RouterTestingModule],
    providers: [
        Usuario,
        { provide: Storage, useValue: { get: () => Promise.resolve(null) } },
        { provide: FirebaseAnalytics, useValue: { setUserId: () => { }, logEvent: () => { } } },
        { provide: AppVersion, useValue: { getVersionNumber: () => Promise.resolve('0.0.0') } },
        { provide: ToastController, useValue: {} },
        { provide: AppComponent, useValue: { registrarDispositivoPush: () => { } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
