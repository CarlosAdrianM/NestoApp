import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { Usuario } from 'src/app/models/Usuario';

import { SelectorVendedoresComponent } from './selector-vendedores.component';

describe('SelectorVendedoresComponent', () => {
  let component: SelectorVendedoresComponent;
  let fixture: ComponentFixture<SelectorVendedoresComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectorVendedoresComponent ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
      providers: [
        Usuario
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectorVendedoresComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
