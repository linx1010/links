import { TestBed } from '@angular/core/testing';

import { OperationMetricsService } from './operation-metrics.service';

describe('OperationMetricsService', () => {
  let service: OperationMetricsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OperationMetricsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
