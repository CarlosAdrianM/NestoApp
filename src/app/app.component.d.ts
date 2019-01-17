import { Nav, Platform, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { Usuario } from '../models/Usuario';
import { FCM } from '@ionic-native/fcm';
export declare class MyApp {
    platform: Platform;
    usuario: Usuario;
    private statusBar;
    private alertCtrl;
    private fcm;
    nav: Nav;
    rootPage: any;
    pages: Array<{
        title: string;
        component: any;
    }>;
    constructor(platform: Platform, usuario: Usuario, statusBar: StatusBar, alertCtrl: AlertController, fcm: FCM);
    initializeApp(): void;
    openPage(page: any): void;
}
