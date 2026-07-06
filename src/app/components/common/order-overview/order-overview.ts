import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { AuthService } from '../../../services/utils/auth-service';
import { OrderService } from '../../../services/order/order-service';
import { GetAllOrdersResponse, OrderResponse } from '../../../interfaces/order';

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
    const skip = (page - 1) * this.PAGE_SIZE;

    if (role === 'unknown') {
      this.orders.set([]);
      this.errorMessage.set('Није могуће учитати поруџбине за тренутну улогу.');
      this.isLoading.set(false);
      return;
    }

    let request$;
    if (role === 'craftsman') {
      request$ = this.orderService.getOrdersByCraftsman(skip, this.PAGE_SIZE);
    } else {
      const customerId = this.getCustomerId();
      if (customerId === null) {
        this.orders.set([]);
        this.errorMessage.set('Није могуће учитати поруџбине за тренутну улогу.');
        this.isLoading.set(false);
        return;
      }
      request$ = this.orderService.getOrdersByCustomer(customerId, skip, this.PAGE_SIZE);
    }

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
          this.errorMessage.set('Грешка приликом учитавања поруџбина.');
        },
      });
  }

  onPageChange(event: PaginatorState): void {
    const skip = event.first ?? 0;
    const limit = event.rows ?? this.PAGE_SIZE;
    const newPage = Math.floor(skip / limit) + 1;
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
    return order.status ?? 'У обради';
  }

  canAccept(order: OrderResponse): boolean {
    const status = this.normalizeStatus(order.status);
    return status !== 'ACCEPTED' && status !== 'DECLINED' && status !== 'REJECTED' && status !== 'SHIPPED';
  }

  canReject(order: OrderResponse): boolean {
    const status = this.normalizeStatus(order.status);
    return status !== 'ACCEPTED' && status !== 'DECLINED' && status !== 'REJECTED' && status !== 'SHIPPED';
  }

  canDeliver(order: OrderResponse): boolean {
    return this.normalizeStatus(order.status) === 'ACCEPTED';
  }

  hasAvailableActions(order: OrderResponse): boolean {
    return this.canAccept(order) || this.canReject(order) || this.canDeliver(order);
  }

  openOrderDocument(order: OrderResponse): void {
    if (!order.url) return;
    window.open(order.url, '_blank', 'noopener,noreferrer');
  }

  onReject(orderId: number): void {
    this.actionLoading.set(true);
    this.errorMessage.set('');

    this.orderService
      .rejectOrder(orderId)
      .pipe(finalize(() => this.actionLoading.set(false)))
      .subscribe({
        next: () => this.loadOrders(this.currentPage()),
        error: () => this.errorMessage.set('Грешка приликом одбијања поруџбине.'),
      });
  }

  onAccept(orderId: number): void {
    this.actionLoading.set(true);
    this.errorMessage.set('');

    this.orderService
      .acceptOrder(orderId)
      .pipe(finalize(() => this.actionLoading.set(false)))
      .subscribe({
        next: () => this.loadOrders(this.currentPage()),
        error: () => this.errorMessage.set('Грешка приликом прихватања поруџбине.'),
      });
  }

  onDeliver(orderId: number): void {
    const customerId = this.orders().find((item) => item.order_id === orderId)?.customer_id;

    if (!Number.isFinite(customerId) || customerId! <= 0) {
      this.errorMessage.set('Грешка: ID купца није доступан за испоруку поруџбине.');
      return;
    }

    this.actionLoading.set(true);
    this.errorMessage.set('');

    this.orderService
      .deliverOrder(orderId, customerId!)
      .pipe(finalize(() => this.actionLoading.set(false)))
      .subscribe({
        next: () => this.loadOrders(this.currentPage()),
        error: () => this.errorMessage.set('Грешка приликом испоруке поруџбине.'),
      });
  }

  private resolveRole(): DashboardRole {
    const role = this.authService.get_role();

    if (role === 'user' || role === 'craftsman') {
      return role;
    }

    return 'unknown';
  }

  private getCustomerId(): number | null {
    const parsed = Number(this.authService.get_id());
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  private normalizeStatus(status?: string): string {
    return (status ?? '').trim().toUpperCase();
  }
}
