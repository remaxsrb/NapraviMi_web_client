import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SetRoles } from './set-roles';

describe('SetRoles', () => {
  let component: SetRoles;
  let fixture: ComponentFixture<SetRoles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SetRoles],
    }).compileComponents();

    fixture = TestBed.createComponent(SetRoles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
