﻿'use strict';
import {Injectable} from '@angular/core';
import {Storage, LocalStorage} from 'ionic-angular';

@Injectable()
export class Usuario {

    private local: Storage = new Storage(LocalStorage);

    constructor() {
        this.local.get('profile').then(profile => {
            this.nombre = JSON.parse(profile);
        }).catch(error => {
            console.log(error);
        });
        /*
        if (!this.nombre) {
            this.nav.push(ProfilePage);
        }
        */
    }

    public nombre: string;

    public almacen: string = 'ALG';
    public delegacion: string = 'ALG';
    public formaVenta: string = 'DIR';
    public vendedor: string;
}
