import { TestBed } from '@angular/core/testing';

import { CraftsmanApplicationService } from './craftsman-application-service';

describe('CraftsmanApplicationService', () => {
  let service: CraftsmanApplicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CraftsmanApplicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
