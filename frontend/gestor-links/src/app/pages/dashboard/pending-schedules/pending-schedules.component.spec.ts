import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingSchedulesComponent } from './pending-schedules.component';

describe('PendingSchedulesComponent', () => {
  let component: PendingSchedulesComponent;
  let fixture: ComponentFixture<PendingSchedulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingSchedulesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingSchedulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
