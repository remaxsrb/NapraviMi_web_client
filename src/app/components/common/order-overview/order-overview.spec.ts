import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { OrderOverview } from './order-overview';
import { AuthService } from '../../../services/utils/auth-service';
import { OrderService } from '../../../services/order/order-service';

describe('OrderOverview', () => {
  let component: OrderOverview;
  let fixture: ComponentFixture<OrderOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderOverview],
      providers: [
        {
          provide: AuthService,
          useValue: {
            get_role: () => 'user',
            get_id: () => '1',
            get_craftsman_id: () => '',
          },
        },
        {
          provide: OrderService,
          useValue: {
            getOrdersByCustomer: () => of({ data: { orders: [] } }),
            getOrdersByCraftsman: () => of({ data: { orders: [] } }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
