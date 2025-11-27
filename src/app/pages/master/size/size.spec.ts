import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SizeListComponent } from './size-list.component';

describe('Size', () => {
  let component: SizeListComponent;
  let fixture: ComponentFixture<SizeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SizeListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SizeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
