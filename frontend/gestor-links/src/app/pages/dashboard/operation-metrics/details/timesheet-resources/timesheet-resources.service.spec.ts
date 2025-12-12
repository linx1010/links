import { TestBed } from '@angular/core/testing';

import { TimesheetResourcesService } from './timesheet-resources.service';

describe('TimesheetResourcesService', () => {
  let service: TimesheetResourcesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimesheetResourcesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
