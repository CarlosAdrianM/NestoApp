import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Usuario } from 'src/app/models/Usuario';
import { CacheService } from 'ionic-cache';

import { SelectorClientesComponent } from './selector-clientes.component';

describe('SelectorClientesComponent', () => {
  let component: SelectorClientesComponent;
  let fixture: ComponentFixture<SelectorClientesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectorClientesComponent ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
      providers: [
        Usuario,
        { provide: CacheService, useValue: { setDefaultTTL: () => {}, loadFromObservable: (k, obs) => obs } },
        { provide: Keyboard, useValue: { show: () => {} } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectorClientesComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
