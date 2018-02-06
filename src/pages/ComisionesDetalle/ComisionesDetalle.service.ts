import { Injectable } from '@angular/core';

@Injectable()
export class ComisionesDetalleService {
  public cargarDetalle(tipoDetalle: string, anno: number, mes: number, incluirAlbaranes: boolean): any {
    return [
      {
        "Empresa": "1",
        "Pedido": 676689,
        "Nombre": "EL EDÉN ALCOBENDAS",
        "Direccion": "C/ SEGOVIA, 1 - LOCAL",
        "Fecha": "2018-01-15T09:03:01+0900",
        "Importe": 123.45
      },
      {
        "Empresa": "1",
        "Pedido": 676686,
        "Nombre": "EL EDÉN LAS TABLAS - DISTRITO TELEFÓNICA",
        "Direccion": "RONDA DE LA COMUNICACIÓN, 22 - JUNTO A FARMACIA",
        "Fecha": "2018-01-16T09:03:01+0900",
        "Importe": 1123.45
      },
      {
        "Empresa": "1",
        "Pedido": 676096,
        "Nombre": "EL EDÉN TOLEDO",
        "Direccion": "VIA PRINCIPAL, 1",
        "Fecha": "2018-01-17T09:03:01+0900",
        "Importe": 113.45
      }, {
        "Empresa": "1",
        "Pedido": 676689,
        "Nombre": "EL EDÉN ALCOBENDAS",
        "Direccion": "C/ SEGOVIA, 1 - LOCAL",
        "Fecha": "2018-01-15T09:03:01+0900",
        "Importe": 123.45
      },
      {
        "Empresa": "1",
        "Pedido": 676686,
        "Nombre": "EL EDÉN LAS TABLAS - DISTRITO TELEFÓNICA",
        "Direccion": "RONDA DE LA COMUNICACIÓN, 22 - JUNTO A FARMACIA",
        "Fecha": "2018-01-16T09:03:01+0900",
        "Importe": 1123.45
      },
      {
        "Empresa": "1",
        "Pedido": 676096,
        "Nombre": "EL EDÉN TOLEDO",
        "Direccion": "VIA PRINCIPAL, 1",
        "Fecha": "2018-01-17T09:03:01+0900",
        "Importe": 113.45
      }, {
        "Empresa": "1",
        "Pedido": 676689,
        "Nombre": "EL EDÉN ALCOBENDAS",
        "Direccion": "C/ SEGOVIA, 1 - LOCAL",
        "Fecha": "2018-01-15T09:03:01+0900",
        "Importe": 123.45
      },
      {
        "Empresa": "1",
        "Pedido": 676686,
        "Nombre": "EL EDÉN LAS TABLAS - DISTRITO TELEFÓNICA",
        "Direccion": "RONDA DE LA COMUNICACIÓN, 22 - JUNTO A FARMACIA",
        "Fecha": "2018-01-16T09:03:01+0900",
        "Importe": 1123.45
      },
      {
        "Empresa": "1",
        "Pedido": 676096,
        "Nombre": "EL EDÉN TOLEDO",
        "Direccion": "VIA PRINCIPAL, 1",
        "Fecha": "2018-01-17T09:03:01+0900",
        "Importe": 113.45
      }
    ]
  }
}
