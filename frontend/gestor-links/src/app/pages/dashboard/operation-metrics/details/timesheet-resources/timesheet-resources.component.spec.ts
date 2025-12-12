import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetResourcesComponent } from './timesheet-resources.component';

describe('TimesheetResourcesComponent', () => {
  let component: TimesheetResourcesComponent;
  let fixture: ComponentFixture<TimesheetResourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesheetResourcesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
