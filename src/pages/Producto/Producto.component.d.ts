import { ProductoService } from './Producto.service';
import { LoadingController, AlertController, NavParams } from 'ionic-angular';
export declare class ProductoComponent {
    private servicio;
    loadingCtrl: LoadingController;
    alertCtrl: AlertController;
    private navParams;
    productoActual: string;
    producto: any;
    constructor(servicio: ProductoService, loadingCtrl: LoadingController, alertCtrl: AlertController, navParams: NavParams);
    ngOnInit(): void;
    cargar(): void;
    seleccionarTexto(evento: any): void;
}
