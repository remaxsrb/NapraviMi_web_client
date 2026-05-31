import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CraftsmanApplication } from './craftsman-application';

describe('CraftsmanApplication', () => {
  let component: CraftsmanApplication;
  let fixture: ComponentFixture<CraftsmanApplication>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CraftsmanApplication],
    }).compileComponents();

    fixture = TestBed.createComponent(CraftsmanApplication);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
