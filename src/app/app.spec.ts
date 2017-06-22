import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { ProfilePage } from '../pages/profile/profile';
import { } from 'jasmine';
import { Deploy } from '@ionic/cloud-angular';
import { Usuario } from '../models/Usuario';
import { StatusBar } from '@ionic-native/status-bar';


let comp: MyApp;
let fixture: ComponentFixture<MyApp>;

export function provideDeploy(): Deploy {
    return null;
}

describe('Component: Root Component', () => {
 
    beforeEach(async(() => {
 
        TestBed.configureTestingModule({
 
            declarations: [MyApp],
 
            providers: [
                { provide: Deploy, useMock: provideDeploy },
                Usuario,
                StatusBar,
            ],
 
            imports: [
                IonicModule.forRoot(MyApp)
            ]
 
        }).compileComponents();
 
    }));
 
    beforeEach(() => {
 
        fixture = TestBed.createComponent(MyApp);
        comp    = fixture.componentInstance;
 
    });
 
    afterEach(() => {
        fixture.destroy();
        comp = null;
    });
 
    it('is created', () => {
 
        expect(fixture).toBeTruthy();
        expect(comp).toBeTruthy();
 
    });
 
    it('initialises with a root page of HomePage', () => {
        expect(comp['rootPage']).toBe(ProfilePage);
    });
 
});
