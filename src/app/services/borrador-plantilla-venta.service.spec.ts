import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage';
import { BorradorPlantillaVentaService } from './borrador-plantilla-venta.service';
import { BorradorPlantillaVenta, BorradorMetadata } from '../models/borrador-plantilla-venta.model';

describe('BorradorPlantillaVentaService', () => {
  let service: BorradorPlantillaVentaService;
  let storageSpy: jasmine.SpyObj<Storage>;
  let storageData: { [key: string]: any };

  const mockBorrador: BorradorPlantillaVenta = {
    id: 'test-uuid-1234',
    fechaCreacion: '2026-02-11T10:00:00.000Z',
    usuario: 'testuser',
    empresa: '1',
    cliente: '12345',
    contacto: '0',
    nombreCliente: 'Cliente Test',
    lineasProducto: [
      {
        producto: 'PROD001',
        texto: 'Producto de prueba',
        cantidad: 2,
        cantidadOferta: 0,
        precio: 10.50,
        descuento: 0.1,
        aplicarDescuento: true,
        iva: 'G21'
      }
    ],
    lineasRegalo: [],
    comentarioRuta: 'Comentario test',
    esPresupuesto: false,
    formaPago: 'EFC',
    plazosPago: '1/30',
    fechaEntrega: '2026-02-14',
    almacenCodigo: 'ALG',
    mantenerJunto: true,
    servirJunto: false,
    total: 21.00
  };

  beforeEach(() => {
    storageData = {};

    const spy = jasmine.createSpyObj('Storage', ['get', 'set', 'remove']);
    spy.get.and.callFake((key: string) => Promise.resolve(storageData[key]));
    spy.set.and.callFake((key: string, value: any) => {
      storageData[key] = value;
      return Promise.resolve();
    });
    spy.remove.and.callFake((key: string) => {
      delete storageData[key];
      return Promise.resolve();
    });

    TestBed.configureTestingModule({
      providers: [
        BorradorPlantillaVentaService,
        { provide: Storage, useValue: spy }
      ]
    });

    service = TestBed.inject(BorradorPlantillaVentaService);
    storageSpy = TestBed.inject(Storage) as jasmine.SpyObj<Storage>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generarId', () => {
    it('should generate a valid UUID format', () => {
      const id = service.generarId();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(service.generarId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('guardarBorrador', () => {
    it('should save borrador to storage', async () => {
      const result = await service.guardarBorrador(mockBorrador);

      expect(result).toEqual(mockBorrador);
      expect(storageSpy.set).toHaveBeenCalledWith('borrador_plantilla_test-uuid-1234', mockBorrador);
    });

    it('should update index when saving', async () => {
      await service.guardarBorrador(mockBorrador);

      const index = storageData['borradores_plantilla_index'] as BorradorMetadata[];
      expect(index).toBeDefined();
      expect(index.length).toBe(1);
      expect(index[0].id).toBe(mockBorrador.id);
      expect(index[0].nombreCliente).toBe('Cliente Test');
      expect(index[0].totalLineasProducto).toBe(1);
    });

    it('should update existing entry in index', async () => {
      // First save
      await service.guardarBorrador(mockBorrador);

      // Second save with same ID but different data
      const updatedBorrador = { ...mockBorrador, nombreCliente: 'Cliente Actualizado' };
      await service.guardarBorrador(updatedBorrador);

      const index = storageData['borradores_plantilla_index'] as BorradorMetadata[];
      expect(index.length).toBe(1);
      expect(index[0].nombreCliente).toBe('Cliente Actualizado');
    });
  });

  describe('obtenerBorradores', () => {
    it('should return empty array when no borradores', async () => {
      const result = await service.obtenerBorradores();
      expect(result).toEqual([]);
    });

    it('should return borradores sorted by date descending', async () => {
      const older: BorradorPlantillaVenta = {
        ...mockBorrador,
        id: 'older-id',
        fechaCreacion: '2026-02-10T10:00:00.000Z'
      };
      const newer: BorradorPlantillaVenta = {
        ...mockBorrador,
        id: 'newer-id',
        fechaCreacion: '2026-02-12T10:00:00.000Z'
      };

      await service.guardarBorrador(older);
      await service.guardarBorrador(newer);

      const result = await service.obtenerBorradores();
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('newer-id');
      expect(result[1].id).toBe('older-id');
    });
  });

  describe('cargarBorrador', () => {
    it('should load a saved borrador', async () => {
      await service.guardarBorrador(mockBorrador);

      const result = await service.cargarBorrador(mockBorrador.id);
      expect(result).toEqual(mockBorrador);
    });

    it('should return null/undefined for non-existent borrador', async () => {
      const result = await service.cargarBorrador('non-existent-id');
      expect(result).toBeFalsy();
    });
  });

  describe('eliminarBorrador', () => {
    it('should remove borrador from storage', async () => {
      await service.guardarBorrador(mockBorrador);
      await service.eliminarBorrador(mockBorrador.id);

      const result = await service.cargarBorrador(mockBorrador.id);
      expect(result).toBeUndefined();
    });

    it('should remove from index', async () => {
      await service.guardarBorrador(mockBorrador);
      await service.eliminarBorrador(mockBorrador.id);

      const index = await service.obtenerBorradores();
      expect(index.length).toBe(0);
    });

    it('should return true on successful delete', async () => {
      await service.guardarBorrador(mockBorrador);
      const result = await service.eliminarBorrador(mockBorrador.id);
      expect(result).toBeTrue();
    });
  });

  describe('contarBorradores', () => {
    it('should return 0 when no borradores', async () => {
      const count = await service.contarBorradores();
      expect(count).toBe(0);
    });

    it('should return correct count', async () => {
      await service.guardarBorrador(mockBorrador);
      await service.guardarBorrador({ ...mockBorrador, id: 'second-id' });

      const count = await service.contarBorradores();
      expect(count).toBe(2);
    });
  });

  describe('exportarComoJson', () => {
    it('should export borrador as formatted JSON', async () => {
      await service.guardarBorrador(mockBorrador);

      const json = await service.exportarComoJson(mockBorrador.id);
      const parsed = JSON.parse(json);

      expect(parsed.id).toBe(mockBorrador.id);
      expect(parsed.cliente).toBe(mockBorrador.cliente);
    });

    it('should throw error for non-existent borrador', async () => {
      await expectAsync(service.exportarComoJson('non-existent'))
        .toBeRejectedWithError('Borrador no encontrado');
    });
  });

  describe('copiarBorradorJson', () => {
    it('should copy JSON to clipboard when available', async () => {
      await service.guardarBorrador(mockBorrador);

      // Mock clipboard API
      const clipboardSpy = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());

      const result = await service.copiarBorradorJson(mockBorrador.id);

      expect(result).toBeTrue();
      expect(clipboardSpy).toHaveBeenCalled();
    });
  });

  describe('metadata extraction', () => {
    it('should correctly extract metadata from borrador', async () => {
      const borradorConRegalo: BorradorPlantillaVenta = {
        ...mockBorrador,
        lineasRegalo: [
          { producto: 'REGALO1', texto: 'Regalo', precio: 5, ganavisiones: 1, iva: 'G21', cantidad: 1 }
        ],
        mensajeError: 'Error de prueba'
      };

      await service.guardarBorrador(borradorConRegalo);

      const borradores = await service.obtenerBorradores();
      expect(borradores[0].totalLineasProducto).toBe(1);
      expect(borradores[0].totalLineasRegalo).toBe(1);
      expect(borradores[0].mensajeError).toBe('Error de prueba');
    });

    it('should handle missing optional fields', async () => {
      const borradorMinimo: BorradorPlantillaVenta = {
        id: 'minimal-id',
        fechaCreacion: '2026-02-11T10:00:00.000Z',
        usuario: 'test',
        empresa: '1',
        cliente: '',
        contacto: '0',
        nombreCliente: '',
        lineasProducto: [],
        lineasRegalo: [],
        comentarioRuta: '',
        esPresupuesto: false,
        formaPago: '',
        plazosPago: '',
        fechaEntrega: '',
        almacenCodigo: '',
        mantenerJunto: false,
        servirJunto: false,
        total: 0
      };

      await service.guardarBorrador(borradorMinimo);

      const borradores = await service.obtenerBorradores();
      expect(borradores[0].nombreCliente).toBe('Sin cliente');
      expect(borradores[0].totalLineasProducto).toBe(0);
    });
  });
});
