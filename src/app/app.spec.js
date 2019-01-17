import { TestBed, async } from '@angular/core/testing';
import { IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { ProfilePage } from '../pages/profile/profile';
import { Usuario } from '../models/Usuario';
import { StatusBar } from '@ionic-native/status-bar';
var comp;
var fixture;
describe('Component: Root Component', function () {
    beforeEach(async(function () {
        TestBed.configureTestingModule({
            declarations: [MyApp],
            providers: [
                Usuario,
                StatusBar,
            ],
            imports: [
                IonicModule.forRoot(MyApp)
            ]
        }).compileComponents();
    }));
    beforeEach(function () {
        fixture = TestBed.createComponent(MyApp);
        comp = fixture.componentInstance;
    });
    afterEach(function () {
        fixture.destroy();
        comp = null;
    });
    it('is created', function () {
        expect(fixture).toBeTruthy();
        expect(comp).toBeTruthy();
    });
    it('initialises with a root page of HomePage', function () {
        expect(comp['rootPage']).toBe(ProfilePage);
    });
});
//# sourceMappingURL=app.spec.js.map