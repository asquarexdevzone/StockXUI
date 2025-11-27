import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfterOrderStockComponent } from './after-order-stock.component';

describe('AfterOrderStockComponent', () => {
  let component: AfterOrderStockComponent;
  let fixture: ComponentFixture<AfterOrderStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfterOrderStockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfterOrderStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
