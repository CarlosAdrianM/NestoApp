import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, ModalController, NavParams } from '@ionic/angular';
import { ClientesMismoTelefonoComponent } from './clientes-mismo-telefono';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ClientesMismoTelefonoComponent', () => {
  let component: ClientesMismoTelefonoComponent;
  let fixture: ComponentFixture<ClientesMismoTelefonoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ClientesMismoTelefonoComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot()],
    providers: [
        { provide: ModalController, useValue: {} },
        { provide: NavParams, useValue: { data: { listaClientes: [] } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(ClientesMismoTelefonoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
