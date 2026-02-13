import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { Usuario } from 'src/app/models/Usuario';
import { Storage } from '@ionic/storage';

import { ExtractoClienteComponent } from './extracto-cliente.component';

describe('ExtractoClienteComponent', () => {
  let component: ExtractoClienteComponent;
  let fixture: ComponentFixture<ExtractoClienteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtractoClienteComponent ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
      providers: [
        Usuario,
        { provide: FileOpener, useValue: {} },
        { provide: FileTransfer, useValue: { create: () => {} } },
        { provide: File, useValue: { dataDirectory: '' } },
        { provide: Storage, useValue: {} },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => {} } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ExtractoClienteComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
