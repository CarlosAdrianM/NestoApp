"use strict";
var Configuracion = (function () {
    function Configuracion() {
    }
    Configuracion.API_URL = 'http://88.26.231.83/api';
    Configuracion.URL_SERVIDOR = 'http://88.26.231.83';
    Configuracion.EMPRESA_POR_DEFECTO = '1';
    Configuracion.ALMACEN_POR_DEFECTO = 'ALG';
    Configuracion.NOMBRE_DOMINIO = 'NUEVAVISION';
    return Configuracion;
}());
exports.Configuracion = Configuracion;
