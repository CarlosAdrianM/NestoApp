import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { SelectorBase } from './selectorbase.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SelectorbaseComponent', () => {

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [SelectorBase],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot()],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  }));

  it('should create', () => {
    expect(SelectorBase).toBeTruthy();
  });
});
