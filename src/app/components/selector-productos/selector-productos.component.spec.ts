import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { CacheService } from 'ionic-cache';
import { Usuario } from 'src/app/models/Usuario';

import { SelectorProductosComponent } from './selector-productos.component';

describe('SelectorProductosComponent', () => {
  let component: SelectorProductosComponent;
  let fixture: ComponentFixture<SelectorProductosComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectorProductosComponent ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
      providers: [
        Usuario,
        { provide: CacheService, useValue: { setDefaultTTL: () => {}, loadFromObservable: (k, obs) => obs } },
        { provide: Keyboard, useValue: { show: () => {} } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectorProductosComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
