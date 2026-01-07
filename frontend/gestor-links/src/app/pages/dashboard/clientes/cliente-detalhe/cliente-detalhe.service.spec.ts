import { TestBed } from '@angular/core/testing';

import { ClienteDetalheService } from './cliente-detalhe.service';

describe('ClienteDetalheService', () => {
  let service: ClienteDetalheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClienteDetalheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
