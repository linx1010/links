import { TestBed } from '@angular/core/testing';

import { FinancialIndicatorsService } from './financial-indicators.service';

describe('FinancialIndicatorsService', () => {
  let service: FinancialIndicatorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinancialIndicatorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
