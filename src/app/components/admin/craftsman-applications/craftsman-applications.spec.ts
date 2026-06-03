import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CraftsmanApplications } from './craftsman-applications';

describe('CraftsmanApplications', () => {
  let component: CraftsmanApplications;
  let fixture: ComponentFixture<CraftsmanApplications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CraftsmanApplications],
    }).compileComponents();

    fixture = TestBed.createComponent(CraftsmanApplications);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
