"use strict";
var Configuracion = (function () {
    function Configuracion() {
    }
    Configuracion.URL_SERVIDOR = 'http://88.26.231.83';
    Configuracion.API_URL = Configuracion.URL_SERVIDOR + '/api';
    Configuracion.EMPRESA_POR_DEFECTO = '1';
    Configuracion.ALMACEN_POR_DEFECTO = 'ALG';
    Configuracion.NOMBRE_DOMINIO = 'NUEVAVISION';
    return Configuracion;
}());
exports.Configuracion = Configuracion;
