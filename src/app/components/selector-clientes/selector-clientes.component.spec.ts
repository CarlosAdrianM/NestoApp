import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { Usuario } from 'src/app/models/Usuario';
import { CacheService } from '../../services/cache.service';

import { SelectorClientesComponent } from './selector-clientes.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SelectorClientesComponent', () => {
  let component: SelectorClientesComponent;
  let fixture: ComponentFixture<SelectorClientesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [SelectorClientesComponent],
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

    fixture = TestBed.createComponent(SelectorClientesComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
