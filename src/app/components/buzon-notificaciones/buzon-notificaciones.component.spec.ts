import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { BuzonNotificacionesComponent } from './buzon-notificaciones.component';
import { BuzonNotificacionesService, NotificacionBuzon } from 'src/app/services/buzon-notificaciones.service';

/** NestoApp#176: la pantalla de avisos (buzón de NestoAPI#387). */
describe('BuzonNotificacionesComponent (#176)', () => {
  let component: BuzonNotificacionesComponent;
  let fixture: ComponentFixture<BuzonNotificacionesComponent>;
  let servicio: any;
  let router: any;

  const aviso = (Id: number, Leida = false, Datos: any = null): NotificacionBuzon =>
    ({ Id, Titulo: 'Aviso ' + Id, Cuerpo: 'Cuerpo ' + Id, Datos, FechaCreacion: '2026-09-24T10:00:00', Leida });
  const pagina = (desde: number, cuantas: number) => Array.from({ length: cuantas }, (_, i) => aviso(desde + i));

  beforeEach(waitForAsync(() => {
    servicio = {
      leer: jasmine.createSpy('leer').and.returnValue(of([aviso(1), aviso(2, true)])),
      refrescarContador: jasmine.createSpy('refrescarContador'),
      marcarLeida: jasmine.createSpy('marcarLeida').and.returnValue(of(null)),
      marcarTodasLeidas: jasmine.createSpy('marcarTodasLeidas').and.returnValue(of(1)),
      eliminar: jasmine.createSpy('eliminar').and.returnValue(of(null))
    };
    router = { navigateByUrl: jasmine.createSpy('navigateByUrl') };
    TestBed.configureTestingModule({
      declarations: [BuzonNotificacionesComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: BuzonNotificacionesService, useValue: servicio },
        { provide: Router, useValue: router },
        { provide: ToastController, useValue: { create: () => Promise.resolve({ present: () => Promise.resolve() }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BuzonNotificacionesComponent);
    component = fixture.componentInstance;
  }));

  it('al entrar carga la primera página y refresca el contador del menú', () => {
    component.ionViewWillEnter();

    expect(servicio.leer).toHaveBeenCalledWith(1);
    expect(component.notificaciones.length).toBe(2);
    expect(component.hayMas).toBeFalse();
    expect(servicio.refrescarContador).toHaveBeenCalled();
  });

  it('si falla la carga lo dice, sin fingir que no hay avisos', () => {
    servicio.leer.and.returnValue(throwError(() => new Error('sin red')));

    component.ionViewWillEnter();
    fixture.detectChanges();

    expect(component.cargaFallida).toBeTrue();
    expect(component.sinNotificaciones).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('No se han podido cargar los avisos');
  });

  it('con la página llena pide la siguiente al llegar al final, sin repetir', () => {
    servicio.leer.and.returnValues(of(pagina(1, 20)), of([aviso(20), aviso(21)]));
    component.ionViewWillEnter();
    expect(component.hayMas).toBeTrue();
    const evento = { target: { complete: jasmine.createSpy('complete') } };

    component.cargarMas(evento);

    expect(servicio.leer).toHaveBeenCalledWith(2);
    expect(component.notificaciones.length).toBe(21);
    expect(component.hayMas).toBeFalse();
    expect(evento.target.complete).toHaveBeenCalled();
  });

  it('tocar un aviso de Novedades lo marca leído y abre la novedad en el comentario', () => {
    const deNovedades = aviso(5, false, { tipo: 'NovedadComentario', novedadId: '360', comentarioId: '12' });

    component.abrir(deNovedades);

    expect(deNovedades.Leida).toBeTrue();
    expect(servicio.marcarLeida).toHaveBeenCalledWith(5);
    expect(router.navigateByUrl.calls.mostRecent().args[0]).toContain('/profile?novedad=360&comentario=12');
  });

  it('un aviso ya leído no se vuelve a marcar; uno sin destino no navega', () => {
    component.abrir(aviso(6, true));

    expect(servicio.marcarLeida).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('si no se puede marcar leído, vuelve a salir como no leído', () => {
    servicio.marcarLeida.and.returnValue(throwError(() => new Error('500')));
    const noLeido = aviso(7);

    component.abrir(noLeido);

    expect(noLeido.Leida).toBeFalse();
  });

  it('marcar todos como leídos', () => {
    component.ionViewWillEnter();

    component.marcarTodasLeidas();

    expect(servicio.marcarTodasLeidas).toHaveBeenCalled();
    expect(component.hayNoLeidas).toBeFalse();
  });

  it('borrar lo quita de la lista; si la API falla, vuelve a su sitio', () => {
    component.ionViewWillEnter();
    const primero = component.notificaciones[0];

    component.eliminar(primero);
    expect(servicio.eliminar).toHaveBeenCalledWith(1, true);
    expect(component.notificaciones.map(n => n.Id)).toEqual([2]);

    servicio.eliminar.and.returnValue(throwError(() => new Error('500')));
    component.eliminar(component.notificaciones[0]);
    expect(component.notificaciones.map(n => n.Id)).toEqual([2]);
  });
});
