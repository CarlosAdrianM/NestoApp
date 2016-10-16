'use strict';
import {Injectable, ViewChild} from '@angular/core';
import {Storage} from '@ionic/storage';
import {NavController, Nav} from 'ionic-angular';
import { ProfilePage } from '../pages/profile/profile';


@Injectable()
export class Usuario {

    @ViewChild(Nav) nav;

    constructor() {
        
        let local: Storage = new Storage();
        local.get('profile').then(profile => {
            console.log(profile);
            this.nombre = profile;
        }).catch(error => {
            console.log(error);
            //this.nav.push(ProfilePage);
        });
        /*
        if (!this.nombre) {
            this.nav.push(ProfilePage);
        }
        */
        // console.log(this.nombre);
    }

    public nombre: string;

    public almacen: string = 'ALG';
    public delegacion: string = 'ALG';
    public formaVenta: string = 'DIR';
    public vendedor: string;
}
