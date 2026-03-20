import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { CacheService } from '../../services/cache.service';
import { Usuario } from 'src/app/models/Usuario';

import { SelectorProductosComponent } from './selector-productos.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SelectorProductosComponent', () => {
  let component: SelectorProductosComponent;
  let fixture: ComponentFixture<SelectorProductosComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [SelectorProductosComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot(), RouterTestingModule],
    providers: [
        Usuario,
        { provide: CacheService, useValue: { setDefaultTTL: () => { }, loadFromObservable: (k, obs) => obs } },
        { provide: Keyboard, useValue: { show: () => { } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(SelectorProductosComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
