import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { AuthService } from '../../../services/utils/auth-service';
import { GetAllOrdersResponse, OrderResponse, OrderService } from '../../../services/order/order-service';

type DashboardRole = 'user' | 'craftsman' | 'unknown';

@Component({
  selector: 'app-order-overview',
  imports: [CommonModule, ButtonModule, PaginatorModule],
  templateUrl: './order-overview.html',
  styleUrl: './order-overview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderOverview implements OnInit {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);

  readonly PAGE_SIZE = 10;

  readonly role = signal<DashboardRole>(this.resolveRole());
  readonly orders = signal<OrderResponse[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly isCraftsman = computed(() => this.role() === 'craftsman');
  readonly totalRecords = signal<number>(0);
  readonly currentPage = signal<number>(1);
  readonly actionLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(page: number = this.currentPage()): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.currentPage.set(page);

    const role = this.role();
    const roleId = this.getRoleId(role);

    if (roleId === null) {
      this.orders.set([]);
      this.errorMessage.set('Nije moguće učitati porudžbine za trenutnu ulogu.');
      this.isLoading.set(false);
      return;
    }

    const request$ = role === 'craftsman'
      ? this.orderService.getOrdersByCraftsman(roleId, page, this.PAGE_SIZE)
      : this.orderService.getOrdersByCustomer(roleId, page, this.PAGE_SIZE);

    request$
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: { data?: GetAllOrdersResponse } | GetAllOrdersResponse) => {
          const payload =
            (response as { data?: GetAllOrdersResponse }).data ??
            (response as GetAllOrdersResponse);
          this.orders.set(payload?.orders ?? []);
          this.totalRecords.set(payload?.total ?? 0);
        },
        error: () => {
          this.orders.set([]);
          this.totalRecords.set(0);
          this.errorMessage.set('Greška prilikom učitavanja porudžbina.');
        },
      });
  }

  onPageChange(event: PaginatorState): void {
    const newPage = (event.first ?? 0) / (event.rows ?? this.PAGE_SIZE) + 1;
    this.loadOrders(newPage);
  }

  formatDate(value?: string): string {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('sr-RS');
  }

  getStatus(order: OrderResponse): string {
    return order.status ?? 'U obradi';
  }

  openOrderDocument(order: OrderResponse): void {
    if (!order.url) return;
    window.open(order.url, '_blank', 'noopener,noreferrer');
  }

  onReject(orderId: number): void {
    const craftsmanId = this.getRoleId('craftsman');
    if (craftsmanId === null) {
      this.errorMessage.set('Greška: ID zanatlije nije dostupan.');
      return;
    }

    this.actionLoading.set(true);
    this.errorMessage.set('');

    this.orderService
      .rejectOrder(orderId, craftsmanId)
      .pipe(finalize(() => this.actionLoading.set(false)))
      .subscribe({
        next: () => this.loadOrders(this.currentPage()),
        error: () => this.errorMessage.set('Greška prilikom odbijanja porudžbine.'),
      });
  }

  onAccept(orderId: number): void {
    const craftsmanId = this.getRoleId('craftsman');
    if (craftsmanId === null) {
      this.errorMessage.set('Greška: ID zanatlije nije dostupan.');
      return;
    }

    this.actionLoading.set(true);
    this.errorMessage.set('');

    this.orderService
      .acceptOrder(orderId, craftsmanId)
      .pipe(finalize(() => this.actionLoading.set(false)))
      .subscribe({
        next: () => this.loadOrders(this.currentPage()),
        error: () => this.errorMessage.set('Greška prilikom prihvatanja porudžbine.'),
      });
  }

  onDeliver(orderId: number): void {
    const craftsmanId = this.getRoleId('craftsman');
    if (craftsmanId === null) {
      this.errorMessage.set('Greška: ID zanatlije nije dostupan.');
      return;
    }

    const order = this.orders().find((item) => item.order_id === orderId);
    const customerId = this.orders().find((item) => item.order_id === orderId)?.customer_id;

    console.log(customerId);

    if (!Number.isFinite(customerId) || customerId! <= 0) {
      this.errorMessage.set('Greška: ID kupca nije dostupan za isporuku porudžbine.');
      return;
    }

    this.actionLoading.set(true);
    this.errorMessage.set('');

    this.orderService
      .deliverOrder(orderId, craftsmanId, customerId!)
      .pipe(finalize(() => this.actionLoading.set(false)))
      .subscribe({
        next: () => this.loadOrders(this.currentPage()),
        error: () => this.errorMessage.set('Greška prilikom isporuke porudžbine.'),
      });
  }

  private resolveRole(): DashboardRole {
    const role = this.authService.get_role();

    if (role === 'user' || role === 'craftsman') {
      return role;
    }

    return 'unknown';
  }

  private getRoleId(role: DashboardRole): number | null {
    const value = role === 'craftsman'
      ? this.authService.get_craftsman_id()
      : this.authService.get_id();

    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
}
