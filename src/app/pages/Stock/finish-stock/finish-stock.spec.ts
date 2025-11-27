import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinishStock } from './finish-stock';

describe('FinishStock', () => {
  let component: FinishStock;
  let fixture: ComponentFixture<FinishStock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinishStock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinishStock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
