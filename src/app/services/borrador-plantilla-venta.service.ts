import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BorradorPlantillaVenta, BorradorMetadata } from '../models/borrador-plantilla-venta.model';

/**
 * Servicio para gestionar borradores de PlantillaVenta
 * Métodos con nombres similares a IBorradorPlantillaVentaService de Nesto
 */
@Injectable({
  providedIn: 'root'
})
export class BorradorPlantillaVentaService {

  private readonly STORAGE_KEY_PREFIX = 'borrador_plantilla_';
  private readonly STORAGE_INDEX_KEY = 'borradores_plantilla_index';

  constructor(private storage: Storage) {}

  /**
   * Guarda un borrador en storage
   * @param borrador Borrador a guardar (debe tener id generado)
   * @returns El borrador guardado
   */
  async guardarBorrador(borrador: BorradorPlantillaVenta): Promise<BorradorPlantillaVenta> {
    // Guardar el borrador completo
    await this.storage.set(this.STORAGE_KEY_PREFIX + borrador.id, borrador);

    // Actualizar índice de metadatos
    await this.actualizarIndice(borrador);

    return borrador;
  }

  /**
   * Obtiene la lista de borradores (solo metadatos)
   * @returns Lista de metadatos ordenada por fecha descendente
   */
  async obtenerBorradores(): Promise<BorradorMetadata[]> {
    const index = await this.storage.get(this.STORAGE_INDEX_KEY) || [];
    return index.sort((a: BorradorMetadata, b: BorradorMetadata) =>
      new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    );
  }

  /**
   * Carga un borrador completo por su ID
   * @param id ID del borrador
   * @returns Borrador completo o null si no existe
   */
  async cargarBorrador(id: string): Promise<BorradorPlantillaVenta | null> {
    return await this.storage.get(this.STORAGE_KEY_PREFIX + id);
  }

  /**
   * Elimina un borrador
   * @param id ID del borrador a eliminar
   * @returns true si se eliminó correctamente
   */
  async eliminarBorrador(id: string): Promise<boolean> {
    // Eliminar el borrador
    await this.storage.remove(this.STORAGE_KEY_PREFIX + id);

    // Actualizar índice
    const index: BorradorMetadata[] = await this.storage.get(this.STORAGE_INDEX_KEY) || [];
    const nuevoIndex = index.filter(b => b.id !== id);
    await this.storage.set(this.STORAGE_INDEX_KEY, nuevoIndex);

    return true;
  }

  /**
   * Cuenta el número de borradores guardados
   * @returns Número de borradores
   */
  async contarBorradores(): Promise<number> {
    const index = await this.storage.get(this.STORAGE_INDEX_KEY) || [];
    return index.length;
  }

  /**
   * Exporta un borrador como JSON string
   * @param id ID del borrador
   * @returns JSON string formateado
   */
  async exportarComoJson(id: string): Promise<string> {
    const borrador = await this.cargarBorrador(id);
    if (!borrador) {
      throw new Error('Borrador no encontrado');
    }
    return JSON.stringify(borrador, null, 2);
  }

  /**
   * Copia el JSON de un borrador al portapapeles
   * @param id ID del borrador
   * @returns true si se copió correctamente
   */
  async copiarBorradorJson(id: string): Promise<boolean> {
    const json = await this.exportarComoJson(id);
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(json);
      return true;
    }
    return false;
  }

  /**
   * Genera un UUID para nuevos borradores
   * @returns UUID string
   */
  generarId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Actualiza el índice de metadatos
   */
  private async actualizarIndice(borrador: BorradorPlantillaVenta): Promise<void> {
    const index: BorradorMetadata[] = await this.storage.get(this.STORAGE_INDEX_KEY) || [];

    // Buscar si ya existe y actualizar, o añadir nuevo
    const existente = index.findIndex(b => b.id === borrador.id);

    const metadata: BorradorMetadata = {
      id: borrador.id,
      fechaCreacion: borrador.fechaCreacion,
      nombreCliente: borrador.nombreCliente || 'Sin cliente',
      cliente: borrador.cliente || '',
      totalLineasProducto: borrador.lineasProducto?.length || 0,
      totalLineasRegalo: borrador.lineasRegalo?.length || 0,
      total: borrador.total || 0,
      mensajeError: borrador.mensajeError
    };

    if (existente >= 0) {
      index[existente] = metadata;
    } else {
      index.push(metadata);
    }

    await this.storage.set(this.STORAGE_INDEX_KEY, index);
  }
}
