import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentErrNotification } from './payment-err-notification';

describe('PaymentErrNotification', () => {
  let component: PaymentErrNotification;
  let fixture: ComponentFixture<PaymentErrNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentErrNotification],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentErrNotification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
