import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportListComponent } from './transport-list.component';

describe('Transport', () => {
  let component: TransportListComponent;
  let fixture: ComponentFixture<TransportListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransportListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
