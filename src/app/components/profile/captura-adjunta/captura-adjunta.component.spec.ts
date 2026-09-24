import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { CapturaAdjuntaComponent } from './captura-adjunta.component';

/** NestoApp#188 / #190: la captura de los comentarios y de las sugerencias de las novedades. */
describe('CapturaAdjuntaComponent', () => {
  let component: CapturaAdjuntaComponent;
  let fixture: ComponentFixture<CapturaAdjuntaComponent>;
  let emitidas: any[];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CapturaAdjuntaComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CapturaAdjuntaComponent);
    component = fixture.componentInstance;
    emitidas = [];
    component.imagenChange.subscribe(i => emitidas.push(i));
  }));

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
});
