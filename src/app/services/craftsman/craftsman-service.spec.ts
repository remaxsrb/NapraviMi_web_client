import { TestBed } from '@angular/core/testing';

import { CraftsmanService } from './craftsman-service';

describe('CraftsmanService', () => {
  let service: CraftsmanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CraftsmanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
