import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelectorBase } from './selectorbase.component';

describe('SelectorbaseComponent', () => {
  let component: SelectorBase;
  let fixture: ComponentFixture<SelectorBase>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectorBase ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    /*
    fixture = TestBed.createComponent(SelectorBase);
    component = fixture.componentInstance;
    fixture.detectChanges();
    */
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
