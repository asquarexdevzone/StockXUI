import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Openingstock } from './opening-stock-list.component';

describe('Openingstock', () => {
  let component: Openingstock;
  let fixture: ComponentFixture<Openingstock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Openingstock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Openingstock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
