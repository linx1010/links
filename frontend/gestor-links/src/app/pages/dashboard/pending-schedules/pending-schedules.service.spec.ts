import { TestBed } from '@angular/core/testing';

import { PendingSchedulesService } from './pending-schedules.service';

describe('PendingSchedulesService', () => {
  let service: PendingSchedulesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PendingSchedulesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
