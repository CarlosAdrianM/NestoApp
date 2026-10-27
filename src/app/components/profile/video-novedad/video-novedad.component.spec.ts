import { of, throwError } from 'rxjs';
import { VideoNovedadComponent } from './video-novedad.component';

/** NestoApp#251 / NestoAPI#711: el vídeo de una novedad. */
describe('VideoNovedadComponent (#251)', () => {
  let modal: VideoNovedadComponent;
  let novedades: any;

  beforeEach(() => {
    novedades = {
      descargarVideo: jasmine.createSpy('descargarVideo').and.returnValue(of(new Blob(['mp4'], { type: 'video/mp4' }))),
      registrarReproduccionVideo: jasmine.createSpy('registrarReproduccionVideo').and.returnValue(of(undefined))
    };
    modal = new VideoNovedadComponent({ dismiss: () => Promise.resolve(true) } as any, novedades);
    modal.novedad = { Id: 715, Version: '2.26.0', Fecha: '', Categoria: 'Nuevo', Titulo: 'Retener pedidos', Ambito: 'NestoApp', TieneVideo: true } as any;
  });

  it('baja el vídeo al abrirse y lo reproduce desde un objectURL', async () => {
    await modal.ngOnInit();
    expect(novedades.descargarVideo).toHaveBeenCalledWith(715);
    expect(modal.url).toContain('blob:');
    expect(modal.error).toBe('');
  });

  it('con 404 dice que no está disponible', async () => {
    novedades.descargarVideo.and.returnValue(throwError(() => ({ statusCode: 404 })));
    await modal.ngOnInit();
    expect(modal.url).toBeNull();
    expect(modal.error).toBe('El vídeo no está disponible en este momento.');
  });

  it('al empezar a reproducir se apunta una sola vez', async () => {
    await modal.ngOnInit();
    modal.alReproducir();
    modal.alReproducir();
    expect(novedades.registrarReproduccionVideo).toHaveBeenCalledTimes(1);
    expect(novedades.registrarReproduccionVideo).toHaveBeenCalledWith(715);
  });

  it('si el registro falla, no pasa nada', async () => {
    novedades.registrarReproduccionVideo.and.returnValue(throwError(() => ({ statusCode: 500 })));
    await modal.ngOnInit();
    expect(() => modal.alReproducir()).not.toThrow();
  });
});
