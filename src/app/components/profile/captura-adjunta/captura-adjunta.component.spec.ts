import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { CapturaAdjuntaComponent, camposCapturas, sePuedeLeerPortapapeles } from './captura-adjunta.component';
import { ErroresService } from 'src/app/services/errores.service';

/** NestoApp#188 / #190: la captura de los comentarios y de las sugerencias de las novedades. */
describe('CapturaAdjuntaComponent', () => {
  let component: CapturaAdjuntaComponent;
  let fixture: ComponentFixture<CapturaAdjuntaComponent>;
  let emitidas: any[];
  let errores: { reportar: jasmine.Spy };

  beforeEach(waitForAsync(() => {
    errores = { reportar: jasmine.createSpy('reportar') };
    TestBed.configureTestingModule({
      declarations: [CapturaAdjuntaComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot()],
      providers: [{ provide: ErroresService, useValue: errores }]
    }).compileComponents();

    fixture = TestBed.createComponent(CapturaAdjuntaComponent);
    component = fixture.componentInstance;
    emitidas = [];
    component.imagenChange.subscribe(i => emitidas.push(i));
  }));

  describe('«Pegar imagen» (#210)', () => {
    it('en la app nativa no sale: el WebView de Android siempre deniega leer el portapapeles', () => {
      expect(sePuedeLeerPortapapeles(true, { read: () => null })).toBeFalse();
    });

    it('en el navegador sale si se puede leer el portapapeles', () => {
      expect(sePuedeLeerPortapapeles(false, { read: () => null })).toBeTrue();
      expect(sePuedeLeerPortapapeles(false, {})).toBeFalse();
      expect(sePuedeLeerPortapapeles(false, undefined)).toBeFalse();
    });

    it('si se deniega el permiso se explica y no va a ELMAH, porque no es un fallo del programa', async () => {
      const denegado = Object.assign(new Error('Read permission denied.'), { name: 'NotAllowedError' });
      spyOn(navigator.clipboard as any, 'read').and.returnValue(Promise.reject(denegado));

      await component.pegarImagen();

      expect(component.errorImagen).toContain('permiso');
      expect(errores.reportar).not.toHaveBeenCalled();
    });

    it('sin imagen copiada se dice y no va a ELMAH', async () => {
      spyOn(navigator.clipboard as any, 'read').and.returnValue(Promise.resolve([{ types: ['text/plain'] }]));

      await component.pegarImagen();

      expect(component.errorImagen).toBe('No hay ninguna imagen copiada.');
      expect(errores.reportar).not.toHaveBeenCalled();
    });

    it('otro fallo al leer sí va a ELMAH', async () => {
      spyOn(navigator.clipboard as any, 'read').and.returnValue(Promise.reject(new Error('raro')));

      await component.pegarImagen();

      expect(errores.reportar).toHaveBeenCalled();
    });
  });

  it('un pantallazo grande de la galería se reduce hasta caber, en vez de rechazarlo', async () => {
    const lienzo = document.createElement('canvas');
    lienzo.width = 300; lienzo.height = 600;
    const ctx = lienzo.getContext('2d');
    const datos = ctx.createImageData(300, 600);
    for (let i = 0; i < datos.data.length; i++) { datos.data[i] = (i % 4 === 3) ? 255 : Math.floor(Math.random() * 256); }
    ctx.putImageData(datos, 0, 0);
    const png: Blob = await new Promise(r => lienzo.toBlob(b => r(b), 'image/png'));
    component.tamanoMaximoImagen = 40 * 1024;
    expect(png.size).toBeGreaterThan(component.tamanoMaximoImagen);

    await component.adjuntarImagen(png);

    expect(component.errorImagen).toBe('');
    expect(component.imagen!.tipo).toBe('image/jpeg');
    expect(emitidas[0].tipo).toBe('image/jpeg'); // el padre se entera: [(imagen)]
  });

  it('si la imagen no se puede leer, se explica y no se adjunta', async () => {
    const ilegible = new File([new Uint8Array(1000)], 'foto.heic', { type: 'image/heic' });

    await component.adjuntarImagen(ilegible);

    expect(component.imagen).toBeNull();
    expect(component.errorImagen).toContain('No se ha podido leer');
  });

  it('quitar la imagen avisa al padre', () => {
    component.imagen = { dataUrl: 'data:image/png;base64,AAAA', tipo: 'image/png' };

    component.quitarImagen();

    expect(component.imagen).toBeNull();
    expect(emitidas).toEqual([null]);
  });

  // Issue #195: en Android se elegía la captura de la galería y no pasaba nada: ni miniatura ni
  // aviso. Nunca debe quedarse sin respuesta, y cada fallo tiene su mensaje para saber cuál fue.
  describe('la captura de la galería nunca se queda sin respuesta (#195)', () => {
    const pngPequeno = () => new File([new Uint8Array([137, 80, 78, 71])], 'captura.png', { type: 'image/png' });

    it('si el fichero no se puede leer, se explica (antes el error se perdía)', async () => {
      const fichero = pngPequeno();
      spyOn(fichero, 'arrayBuffer').and.rejectWith(new DOMException('no', 'NotReadableError'));

      await component.adjuntarImagen(fichero);

      expect(component.imagen).toBeNull();
      expect(component.errorImagen).toContain('No se ha podido leer');
      expect(component.preparandoImagen).toBeFalse();
    });

    it('si prepararla se queda colgada, al rato avisa en vez de esperar para siempre', async () => {
      const fichero = pngPequeno();
      spyOn(fichero, 'arrayBuffer').and.returnValue(new Promise<ArrayBuffer>(() => { }));
      component.tiempoMaximoPreparacionMs = 30;

      await component.adjuntarImagen(fichero);

      expect(component.imagen).toBeNull();
      expect(component.errorImagen).toContain('tarda demasiado');
      expect(component.preparandoImagen).toBeFalse();
    });

    // El catch controla el error, así que el GlobalErrorHandler no lo ve: se manda a ELMAH a mano,
    // con el paso en el que se quedó, el tipo y el tamaño.
    it('el fallo llega a ELMAH con el paso en el que se quedó', async () => {
      const fichero = pngPequeno();
      spyOn(fichero, 'arrayBuffer').and.returnValue(new Promise<ArrayBuffer>(() => { }));
      component.tiempoMaximoPreparacionMs = 30;

      await component.adjuntarImagen(fichero);

      expect(errores.reportar).toHaveBeenCalledTimes(1);
      const [error, contexto] = errores.reportar.calls.mostRecent().args;
      expect(error.name).toBe('TiempoAgotado');
      expect(contexto).toContain('captura-adjunta');
      expect(contexto).toContain('leer el fichero');
      expect(contexto).toContain('image/png');
    });

    it('mientras se prepara, se ve que se está preparando', async () => {
      const fichero = pngPequeno();
      let soltar: (b: ArrayBuffer) => void;
      spyOn(fichero, 'arrayBuffer').and.returnValue(new Promise<ArrayBuffer>(r => soltar = r));

      const adjuntando = component.adjuntarImagen(fichero);
      expect(component.preparandoImagen).toBeTrue();
      soltar(new Uint8Array([137, 80, 78, 71]).buffer);
      await adjuntando;

      expect(component.preparandoImagen).toBeFalse();
      expect(component.imagen!.dataUrl).toContain('data:image/png;base64,');
    });

    it('si de la galería no llega ningún fichero, se dice', () => {
      component.alElegirFichero({ target: { files: [], value: '' } } as any);

      expect(component.errorImagen).toContain('No ha llegado');
    });

    it('no vacía el selector hasta haber leído el fichero elegido', async () => {
      let terminar: () => void;
      spyOn(component, 'adjuntarImagen').and.returnValue(new Promise<void>(r => terminar = r));
      const input = { files: [pngPequeno()], value: 'C:\\fakepath\\captura.png' };

      const eligiendo = component.alElegirFichero({ target: input } as any);
      expect(input.value).not.toBe('');
      terminar();
      await eligiendo;

      expect(input.value).toBe('');
    });
  });
});

/** NestoApp#258 (NestoAPI#754, sugerencia 900): varias capturas en una sugerencia o un comentario. */
describe('CapturaAdjuntaComponent: varias capturas (#258)', () => {
  let component: CapturaAdjuntaComponent;
  let listas: any[][];
  const png = () => new File([new Uint8Array([137, 80, 78, 71])], 'captura.png', { type: 'image/png' });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CapturaAdjuntaComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot()],
      providers: [{ provide: ErroresService, useValue: { reportar: () => { } } }]
    }).compileComponents();
    component = TestBed.createComponent(CapturaAdjuntaComponent).componentInstance;
    listas = [];
    component.imagenesChange.subscribe(l => listas.push(l));
  }));

  it('cada captura se añade al final y el padre recibe la lista', async () => {
    await component.adjuntarImagen(png());
    await component.adjuntarImagen(png());

    expect(component.imagenes.length).toBe(2);
    expect(component.imagen).toBe(component.imagenes[0]); // compatibilidad: la primera
    expect(listas[listas.length - 1].length).toBe(2);
  });

  it('se puede quitar una cualquiera', async () => {
    await component.adjuntarImagen(png());
    await component.adjuntarImagen(new File([new Uint8Array([255, 216, 255])], 'b.jpg', { type: 'image/jpeg' }));
    const segunda = component.imagenes[1];

    component.quitarImagen(0);

    expect(component.imagenes).toEqual([segunda]);
  });

  it('de la galería pueden venir varias de una vez', async () => {
    const input = { files: [png(), png(), png()], value: 'x' };
    await component.alElegirFichero({ target: input } as any);
    expect(component.imagenes.length).toBe(3);
    expect(input.value).toBe('');
  });

  it('como máximo 10', async () => {
    component.imagenes = Array.from({ length: 10 }, (_, i) => ({ dataUrl: 'data:image/png;base64,' + i, tipo: 'image/png' }));
    await component.adjuntarImagen(png());
    expect(component.imagenes.length).toBe(10);
    expect(component.errorImagen).toContain('10 capturas');
  });

  it('lo que viaja: la primera en ImagenBase64 (servidores viejos) y, con más de una, todas en ImagenesBase64', () => {
    const a = { dataUrl: 'data:image/png;base64,AAAA', tipo: 'image/png' };
    const b = { dataUrl: 'data:image/jpeg;base64,BBBB', tipo: 'image/jpeg' };
    expect(camposCapturas([])).toEqual({});
    expect(camposCapturas(null)).toEqual({});
    expect(camposCapturas([a])).toEqual({ ImagenBase64: a.dataUrl, ImagenTipo: 'image/png' });
    expect(camposCapturas([a, b])).toEqual({ ImagenBase64: a.dataUrl, ImagenTipo: 'image/png', ImagenesBase64: [a.dataUrl, b.dataUrl] });
  });
});
