export interface ReclamacionDeuda {
    Correo: string;
    Movil: string;
    Importe: number;
    Asunto: string;
    Nombre?: string;
    Direccion?: string;
    TextoSMS: string;
    Cliente: string;
    TramitadoOK: boolean;
    Enlace: string;
}
