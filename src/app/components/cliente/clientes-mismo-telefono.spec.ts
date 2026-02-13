import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, ModalController, NavParams } from '@ionic/angular';
import { ClientesMismoTelefonoComponent } from './clientes-mismo-telefono';

describe('ClientesMismoTelefonoComponent', () => {
  let component: ClientesMismoTelefonoComponent;
  let fixture: ComponentFixture<ClientesMismoTelefonoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientesMismoTelefonoComponent],
      imports: [IonicModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: ModalController, useValue: {} },
        { provide: NavParams, useValue: { data: { listaClientes: [] } } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientesMismoTelefonoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
