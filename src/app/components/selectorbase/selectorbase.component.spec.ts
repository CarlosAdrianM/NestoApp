import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { SelectorBase } from './selectorbase.component';

describe('SelectorbaseComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectorBase ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(SelectorBase).toBeTruthy();
  });
});
