import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController, NavParams } from '@ionic/angular';
import { ClientesMismoTelefonoComponent } from './clientes-mismo-telefono';

describe('ClientesMismoTelefonoComponent', () => {
  let component: ClientesMismoTelefonoComponent;
  let fixture: ComponentFixture<ClientesMismoTelefonoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientesMismoTelefonoComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: {} },
        { provide: NavParams, useValue: { data: { listaClientes: [] } } }
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
