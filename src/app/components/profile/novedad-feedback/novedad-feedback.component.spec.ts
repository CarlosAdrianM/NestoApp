import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AlertController, IonicModule, ModalController, ToastController } from '@ionic/angular';
import { of, throwError } from 'rxjs';

import { NovedadFeedbackComponent } from './novedad-feedback.component';
import { CapturaAdjuntaComponent } from '../captura-adjunta/captura-adjunta.component';
import { TrozosMencionPipe } from 'src/app/pipes/trozos-mencion.pipe';
import { Novedad, NovedadesService } from 'src/app/services/novedades.service';
import { Configuracion } from '../../configuracion/configuracion/configuracion.component';

/** NestoApp#188 / NestoAPI#520: votos y comentarios con captura bajo cada novedad del perfil. */
describe('NovedadFeedbackComponent (#188)', () => {
  let component: NovedadFeedbackComponent;
  let fixture: ComponentFixture<NovedadFeedbackComponent>;
  let servicio: any;
  let alertas: any[];
  let botonesPulsados: string[];
  let toasts: any[];

  const novedad = (extra: Partial<Novedad> = {}): Novedad => ({
    Id: 7, Version: '2.20.5', Fecha: '2026-09-22', Categoria: 'Nuevo', Titulo: 't', Ambito: 'NestoApp',
    VotosPositivos: 3, VotosNegativos: 1, MiVoto: null, NumeroComentarios: 2, ...extra
  });
  const comentario = (id: number, esMio: boolean, tieneImagen = false) => ({
    Id: id, NovedadId: 7, NombreVisible: esMio ? 'Yo' : 'Otro', Cliente: 'NestoApp', VersionCliente: '2.20.5',
    Texto: 'texto ' + id, Fecha: '2026-09-23T10:00:00', TieneImagen: tieneImagen, EsMio: esMio
  });

  beforeEach(waitForAsync(() => {
    alertas = [];
    botonesPulsados = [];
    toasts = [];
    servicio = {
      votar: jasmine.createSpy('votar').and.returnValue(of(null)),
      leerComentarios: jasmine.createSpy('leerComentarios').and.returnValue(of([comentario(1, false), comentario(2, true)])),
      crearComentario: jasmine.createSpy('crearComentario').and.callFake((id: number, c: any) => of({ ...comentario(3, true, !!c.ImagenBase64), Texto: c.Texto })),
      borrarComentario: jasmine.createSpy('borrarComentario').and.returnValue(of(null)),
      leerImagenComentario: jasmine.createSpy('leerImagenComentario').and.returnValue(of(new Blob(['x'], { type: 'image/png' })))
    };

    TestBed.configureTestingModule({
      declarations: [NovedadFeedbackComponent, CapturaAdjuntaComponent, TrozosMencionPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: NovedadesService, useValue: servicio },
        { provide: ModalController, useValue: { create: () => Promise.resolve({ present: () => Promise.resolve() }) } },
        { provide: ToastController, useValue: { create: (o: any) => { toasts.push(o); return Promise.resolve({ present: () => Promise.resolve() }); } } },
        {
          provide: AlertController, useValue: {
            create: (opts: any) => {
              alertas.push(opts);
              return Promise.resolve({
                present: async () => {
                  const texto = botonesPulsados.shift();
                  const boton = (opts.buttons || []).find((b: any) => b && b.text === texto);
                  if (boton && boton.handler) { await boton.handler(); }
                }
              });
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NovedadFeedbackComponent);
    component = fixture.componentInstance;
    component.novedad = novedad();
  }));

  it('sin los contadores de la API no enseña nada (como hasta ahora)', () => {
    component.novedad = novedad({ VotosPositivos: undefined });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });

  it('votar se pinta al momento y se manda a la API', fakeAsync(() => {
    component.votar(1);
    tick();

    expect(component.novedad.VotosPositivos).toBe(4);
    expect(component.novedad.MiVoto).toBe(1);
    expect(servicio.votar).toHaveBeenCalledWith(7, 1);
  }));

  it('pulsar otra vez el mismo voto lo quita', fakeAsync(() => {
    component.novedad = novedad({ MiVoto: 1 });
    component.votar(1);
    tick();

    expect(servicio.votar).toHaveBeenCalledWith(7, 0);
    expect(component.novedad.MiVoto).toBeNull();
  }));

  it('si el voto falla se revierte', fakeAsync(() => {
    servicio.votar.and.returnValue(throwError(() => ({ status: 500 })));
    component.votar(-1);
    tick();

    expect(component.novedad.VotosNegativos).toBe(1);
    expect(component.novedad.MiVoto).toBeNull();
    expect(toasts.length).toBe(1);
  }));

  it('abrir los comentarios los carga', fakeAsync(() => {
    component.abrirOCerrarComentarios();
    tick();

    expect(servicio.leerComentarios).toHaveBeenCalledWith(7);
    expect(component.comentarios.length).toBe(2);
  }));

  it('un comentario sin imagen se manda con la versión de la app', fakeAsync(() => {
    component.abrirOCerrarComentarios();
    tick();
    component.nuevoTexto = '  Muy útil  ';

    component.enviarComentario();
    tick();

    expect(servicio.crearComentario).toHaveBeenCalledWith(7, { Texto: 'Muy útil', VersionCliente: Configuracion.VERSION });
    expect(component.comentarios.length).toBe(3);
    expect(component.novedad.NumeroComentarios).toBe(3);
    expect(component.nuevoTexto).toBe('');
  }));

  it('un comentario con captura manda la imagen y su tipo', fakeAsync(() => {
    component.imagenAdjunta = { dataUrl: 'data:image/png;base64,AAAA', tipo: 'image/png' };
    component.nuevoTexto = 'Mira esto';

    component.enviarComentario();
    tick();

    expect(servicio.crearComentario).toHaveBeenCalledWith(7, jasmine.objectContaining({
      Texto: 'Mira esto', ImagenBase64: 'data:image/png;base64,AAAA', ImagenTipo: 'image/png'
    }));
    expect(component.imagenAdjunta).toBeNull();
  }));

  // Los de reducir y leer la captura están en captura-adjunta.component.spec.ts.

  it('si la API rechaza el comentario se enseña su mensaje y no se pierde lo escrito', fakeAsync(() => {
    servicio.crearComentario.and.returnValue(throwError(() => ({
      isBusinessError: true, apiError: { error: { code: 'BUSINESS_ERROR', message: 'La imagen es demasiado grande (máximo 2 MB).' } }
    })));
    component.nuevoTexto = 'Mira esto';

    component.enviarComentario();
    tick();

    expect(alertas.some(a => (a.message || '').includes('máximo 2 MB'))).toBeTrue();
    expect(component.nuevoTexto).toBe('Mira esto');
  }));

  it('solo se pueden borrar los comentarios propios, y tras confirmar', fakeAsync(() => {
    component.abrirOCerrarComentarios();
    tick();

    component.borrarComentario(component.comentarios[0]); // de otro
    tick();
    expect(alertas.length).toBe(0);

    botonesPulsados = ['Borrar'];
    component.borrarComentario(component.comentarios[1]); // mío
    tick();

    expect(servicio.borrarComentario).toHaveBeenCalledWith(2);
    expect(component.comentarios.map(c => c.Id)).toEqual([1]);
    expect(component.novedad.NumeroComentarios).toBe(1);
  }));

  // NestoApp#193: desde la push «Te han contestado», los comentarios se abren solos y se resalta la respuesta.
  it('#193: con un comentario marcado, abre los comentarios (recién pedidos) y lo resalta', fakeAsync(() => {
    component.comentarioResaltado = 2;
    component.ngOnChanges({ comentarioResaltado: {} as any });
    tick(200);

    expect(component.comentariosAbiertos).toBeTrue();
    expect(servicio.leerComentarios).toHaveBeenCalledWith(7);
    expect(component.comentarioResaltadoVisible).toBe(2);

    tick(5000);
    expect(component.comentarioResaltadoVisible).toBeNull();
  }));

  it('#193: si ya estaban abiertos, se vuelven a pedir para que salga la respuesta', fakeAsync(() => {
    component.abrirOCerrarComentarios();
    tick();
    servicio.leerComentarios.calls.reset();

    component.comentarioResaltado = 2;
    component.ngOnChanges({ comentarioResaltado: {} as any });
    tick(5000);

    expect(component.comentariosAbiertos).toBeTrue();
    expect(servicio.leerComentarios).toHaveBeenCalledTimes(1);
  }));
});
