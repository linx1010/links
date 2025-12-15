import { TestBed } from '@angular/core/testing';

import { UserConfiguratorService } from './user-configurator.service';

describe('UserConfiguratorService', () => {
  let service: UserConfiguratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserConfiguratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
