import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomepageWelcome } from './homepage-welcome';

describe('HomepageWelcome', () => {
  let component: HomepageWelcome;
  let fixture: ComponentFixture<HomepageWelcome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomepageWelcome],
    }).compileComponents();

    fixture = TestBed.createComponent(HomepageWelcome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
