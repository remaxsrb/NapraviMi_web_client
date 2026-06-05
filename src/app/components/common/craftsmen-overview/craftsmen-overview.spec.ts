import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CraftsmenOverview } from './craftsmen-overview';

describe('CraftsmenOverview', () => {
  let component: CraftsmenOverview;
  let fixture: ComponentFixture<CraftsmenOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CraftsmenOverview],
    }).compileComponents();

    fixture = TestBed.createComponent(CraftsmenOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
