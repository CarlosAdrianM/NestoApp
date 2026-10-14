import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, LoadingController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { Usuario } from 'src/app/models/Usuario';
import { Geolocation } from '../../services/geolocation.service';
import { NativeGeocoder } from '@awesome-cordova-plugins/native-geocoder/ngx';
import { FirebaseAnalytics } from '../../services/firebase-analytics.service';
import { CacheService } from '../../services/cache.service';

import { ListaRapportsComponent } from './lista-rapports.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ListaRapportsService } from './lista-rapports.service';
import { Events } from 'src/app/services/events.service';
import { VisorFicheros } from 'src/app/services/visor-ficheros.service';

describe('ListaRapportsComponent', () => {
  let component: ListaRapportsComponent;
  let fixture: ComponentFixture<ListaRapportsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ListaRapportsComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot(), RouterTestingModule],
    providers: [
        Usuario,
        { provide: CacheService, useValue: { setDefaultTTL: () => { }, loadFromObservable: (k, obs) => obs } },
        { provide: Geolocation, useValue: {} },
        { provide: NativeGeocoder, useValue: {} },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(ListaRapportsComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('clientes para contactar (#212)', () => {
    const sugerencia = (cliente: string, orden: number, atendida = false) => ({
      SugerenciaId: orden, Cliente: cliente, Contacto: '0', Nombre: 'Cliente ' + cliente, Direccion: 'C/ Mayor 1',
      Poblacion: 'Madrid', Telefono: '600112233', Prioridad: 'Alta', Orden: orden, Motivo: 'Le toca por cadencia',
      Probabilidad: 0.4, DiasDesdeUltimoContacto: 20, DiasDesdeUltimoPedido: 40, CadenciaDias: 15,
      PedidosUltimos12Meses: 6, ImporteUltimos12Meses: 1500, Atendida: atendida
    });
    const ritmo = {
      ContactosHoy: 3, ContactosSemana: 10, ContactosMes: 25, ObjetivoMes: 120, ObjetivoHoy: 8,
      DiasLaborablesRestantesMes: 18, PendientesMaxima: 1, PendientesAlta: 4, PendientesMedia: 6, PendientesBaja: 9,
      Frase: 'Vas bien, sigue así'
    };
    let servicio: ListaRapportsService;

    beforeEach(() => {
      servicio = TestBed.inject(ListaRapportsService);
      component.vendedorSeleccionado = 'MPP';
    });

    it('al entrar en la pestaña carga las sugerencias del vendedor, ordenadas, con su ritmo', async () => {
      spyOn(servicio, 'cargarSugerenciasContacto').and.returnValue(of({
        Vendedor: 'MPP', Fecha: '2026-10-07', Ritmo: ritmo,
        Sugerencias: [sugerencia('1', 1, true), sugerencia('3', 3), sugerencia('2', 2)]
      }) as any);

      component.verClientesParaLlamar();
      await fixture.whenStable();

      expect(servicio.cargarSugerenciasContacto).toHaveBeenCalledWith('MPP');
      expect(component.sugerenciasContacto.map(s => s.Cliente)).toEqual(['2', '3', '1']);
      expect(component.ritmoContacto).toEqual(ritmo);
      fixture.detectChanges();
      const texto = fixture.nativeElement.textContent as string;
      expect(texto).toContain('Vas bien, sigue así');
      expect(texto).toContain('Le toca por cadencia');
    });

    it('«Llamar» va en la barra, no como un segmento más (no cabían)', () => {
      spyOn(servicio, 'cargarSugerenciasContacto').and.returnValue(of(null));
      fixture.detectChanges();

      const segmentos = Array.from(fixture.nativeElement.querySelectorAll('ion-segment-button')).map((b: any) => b.getAttribute('value'));
      expect(segmentos).not.toContain('contactar');
      const botones = Array.from(fixture.nativeElement.querySelectorAll('ion-toolbar ion-button')) as HTMLElement[];
      expect(botones.some(b => b.innerHTML.includes('Llamar'))).toBeTrue();
    });

    it('volver a pulsar «Llamar» estando ya en la lista no la vuelve a pedir', () => {
      spyOn(servicio, 'cargarSugerenciasContacto').and.returnValue(of(null));

      component.verClientesParaLlamar();
      component.verClientesParaLlamar();

      expect(servicio.cargarSugerenciasContacto).toHaveBeenCalledTimes(1);
    });

    it('si la API no tiene el endpoint (null) lo dice y no deja la lista a medias', async () => {
      spyOn(servicio, 'cargarSugerenciasContacto').and.returnValue(of(null));

      await component.cargarSugerenciasContacto();

      expect(component.sugerenciasContacto).toEqual([]);
      expect(component.ritmoContacto).toBeNull();
      expect(component.mensajeSugerenciasContacto).toContain('todavía no');
    });

    it('si falla la carga, la lista queda vacía y se avisa', async () => {
      spyOn(servicio, 'cargarSugerenciasContacto').and.returnValue(throwError(() => ({ statusCode: 500 })));

      await component.cargarSugerenciasContacto();

      expect(component.sugerenciasContacto).toEqual([]);
      expect(component.mensajeSugerenciasContacto).toContain('No se han podido cargar');
    });

    it('al crear el rapport de un cliente sugerido, su sugerencia queda atendida y baja al final', () => {
      component.sugerenciasContacto = [sugerencia('1', 1), sugerencia('2', 2)] as any;

      TestBed.inject(Events).publish('rapportCreado', { Cliente: '1    ', Contacto: '0  ' });

      expect(component.sugerenciasContacto.map(s => s.Cliente)).toEqual(['2', '1']);
      expect(component.sugerenciasContacto[1].Atendida).toBeTrue();
    });

    it('pulsar una sugerencia abre un rapport nuevo de ese cliente', () => {
      spyOn(component, 'annadirRapport');

      component.contactarSugerencia(sugerencia('1', 1) as any);

      expect(component.annadirRapport).toHaveBeenCalledWith({ Cliente: '1', Contacto: '0' });
    });
  });
});

/** NestoApp#219 (Nesto#521) y #226 (NestoAPI#593): otros vendedores y cheques regalo en «Llamar». */
describe('ListaRapportsComponent: vendedores visibles y cheques regalo (#219 / #226)', () => {
  let component: ListaRapportsComponent;
  let servicio: ListaRapportsService;
  let visor: any;

  const resumen = {
    Campana: { Codigo: 'CHEQUE50_OCT_2026', Descripcion: 'Cheque regalo octubre', Importe: 50, GeneraDesde: '', GeneraHasta: '', CanjeHasta: '2026-11-07T00:00:00', DiasRestantes: 25, Activa: true, InicioImpulsoLlamadas: '', EnImpulsoLlamadas: false },
    Vendedores: [{ Vendedor: 'JGP', Nombre: 'Javier', Generados: 2, Usados: 0, EnPedido: 0, Servidos: 0, Pendientes: 2, PendientesDeActivar: 0, Caducados: 0, Anulados: 0 }],
    Total: { Vendedor: null, Nombre: 'Total', Generados: 2, Usados: 0, EnPedido: 0, Servidos: 0, Pendientes: 2, PendientesDeActivar: 0, Caducados: 0, Anulados: 0 }
  };

  beforeEach(waitForAsync(() => {
    visor = { abrir: jasmine.createSpy('abrir').and.returnValue(Promise.resolve()) };
    TestBed.configureTestingModule({
      declarations: [ListaRapportsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        Usuario,
        { provide: CacheService, useValue: { setDefaultTTL: () => { }, loadFromObservable: (k, obs) => obs } },
        { provide: Geolocation, useValue: {} },
        { provide: NativeGeocoder, useValue: {} },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        { provide: VisorFicheros, useValue: visor },
        { provide: LoadingController, useValue: { create: () => Promise.resolve({ present: () => Promise.resolve(), dismiss: () => Promise.resolve() }) } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
    component = TestBed.createComponent(ListaRapportsComponent).componentInstance;
    servicio = TestBed.inject(ListaRapportsService);
    component.vendedorSeleccionado = 'ASH';
    spyOn(servicio, 'cargarSugerenciasContacto').and.returnValue(of(null));
  }));

  it('#219: con varios vendedores visibles hay selector; si el elegido no es de ellos, pasa al primero y recarga', async () => {
    spyOn(servicio, 'cargarVendedoresVisibles').and.returnValue(of([{ Vendedor: 'JGP', Nombre: 'Javier' }, { Vendedor: 'MPP', Nombre: 'Marta' }]));

    await component.cargarVendedoresVisibles();

    expect(component.hayVariosVendedoresVisibles).toBeTrue();
    expect(component.vendedorSeleccionado).toBe('JGP');
  });

  it('#219: sin el endpoint (null) no hay selector y el vendedor no cambia', async () => {
    spyOn(servicio, 'cargarVendedoresVisibles').and.returnValue(of(null));

    await component.cargarVendedoresVisibles();

    expect(component.hayVariosVendedoresVisibles).toBeFalse();
    expect(component.vendedorSeleccionado).toBe('ASH');
  });

  it('#219: un 403 tiene su propio mensaje', async () => {
    (servicio.cargarSugerenciasContacto as jasmine.Spy).and.returnValue(throwError(() => ({ status: 403 })));

    await component.cargarSugerenciasContacto();

    expect(component.mensajeSugerenciasContacto).toBe('No puedes ver los clientes para contactar de ese vendedor.');
  });

  it('#226: sin campaña (404 → null) no hay pestaña de cheques', async () => {
    spyOn(servicio, 'cargarResumenChequesRegalo').and.returnValue(of(null));
    await component.cargarResumenCheques();
    expect(component.resumenCheques).toBeNull();
  });

  it('#226: con campaña, la pestaña carga los pendientes del vendedor elegido y tocar una fila cambia de vendedor', async () => {
    spyOn(servicio, 'cargarResumenChequesRegalo').and.returnValue(of(resumen as any));
    const pendientes = spyOn(servicio, 'cargarChequesRegaloPendientes').and.returnValue(of([]));
    await component.cargarResumenCheques();

    component.segmentoRapports = 'contactar';
    component.cambiarVistaContactar('cheques');
    expect(pendientes).toHaveBeenCalledWith('ASH');

    component.elegirVendedorResumen(resumen.Vendedores[0]);
    expect(component.vendedorSeleccionado).toBe('JGP');
    expect(pendientes).toHaveBeenCalledWith('JGP');
  });

  it('#226: «Factura» baja el PDF con la empresa de la factura y lo abre', async () => {
    const descarga = spyOn(servicio, 'descargarFactura').and.returnValue(of(new Blob(['%PDF'])));

    await component.verFacturaCheque({ EmpresaFactura: '3', FacturaOrigen: 'GB2600012 ', Cliente: '1', Contacto: '0' } as any);

    expect(descarga).toHaveBeenCalledWith('3', 'GB2600012 ');
    expect(visor.abrir).toHaveBeenCalledWith(jasmine.any(Blob), 'Factura_GB2600012.pdf', 'application/pdf');
  });

  it('#226: llamar o WhatsApp abren el rapport nuevo de teléfono o de WhatsApp', () => {
    spyOn(component, 'annadirRapport');

    component.abrirRapportCheque({ Cliente: '37320', Contacto: '0' } as any, 'W');

    expect(component.annadirRapport).toHaveBeenCalledWith({ Cliente: '37320', Contacto: '0' }, 'W');
  });
});
