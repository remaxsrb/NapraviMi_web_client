import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../services/order/order-service';
import { CategoryOrderCount, OrderResponse } from '../../../interfaces/order';
import { CraftsmanShippedOrdersChart } from './craftsman-shipped-orders-chart/craftsman-shipped-orders-chart';
import { CategoryOrdersChart } from './category-orders-chart/category-orders-chart';

const FETCH_LIMIT = 500;

@Component({
  selector: 'app-craftsman-dashboard-home',
  standalone: true,
  imports: [CommonModule, CraftsmanShippedOrdersChart, CategoryOrdersChart],
  templateUrl: './craftsman-dashboard-home.html',
  styleUrl: './craftsman-dashboard-home.css',
})
export class CraftsmanDashboardHome implements OnInit {
  readonly orders = signal<OrderResponse[]>([]);
  readonly categoryCounts = signal<CategoryOrderCount[]>([]);

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getOrdersByCraftsman(0, FETCH_LIMIT).subscribe({
      next: (response) => {
        this.orders.set(response.data?.orders ?? []);
        this.categoryCounts.set(response.data?.category_counts ?? []);
      },
      error: () => {
        // Charts stay at their zero-filled default if orders can't be loaded.
      },
    });
  }
}
