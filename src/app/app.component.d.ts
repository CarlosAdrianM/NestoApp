import { Nav, Platform } from 'ionic-angular';
import { Usuario } from '../models/Usuario';
import { Deploy } from '@ionic/cloud-angular';
export declare class MyApp {
    platform: Platform;
    deploy: Deploy;
    usuario: Usuario;
    nav: Nav;
    rootPage: any;
    pages: Array<{
        title: string;
        component: any;
    }>;
    constructor(platform: Platform, deploy: Deploy, usuario: Usuario);
    initializeApp(): void;
    openPage(page: any): void;
}
