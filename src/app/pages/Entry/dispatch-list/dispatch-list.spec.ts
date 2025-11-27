import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispatchList } from './dispatch-list';

describe('DispatchList', () => {
  let component: DispatchList;
  let fixture: ComponentFixture<DispatchList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DispatchList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DispatchList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
