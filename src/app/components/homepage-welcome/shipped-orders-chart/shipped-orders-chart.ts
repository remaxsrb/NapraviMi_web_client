import { Component, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { OrderService } from '../../../services/order/order-service';
import { ThemeService } from '../../../services/utils/theme-service';
import { buildMonthlyBarChartData, buildMonthlyBarChartOptions, lastFourMonths } from '../../common/charts/monthly-bar-chart';

const DATASET_LABEL = 'Испоручене поруџбине';

@Component({
  selector: 'app-shipped-orders-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './shipped-orders-chart.html',
  styleUrl: './shipped-orders-chart.css',
})
export class ShippedOrdersChart implements OnInit {
  readonly chartData = signal<any>(undefined);
  readonly chartOptions = signal<any>(undefined);

  private labels: string[] = [];
  private counts: number[] = [];

  constructor(
    private orderService: OrderService,
    private themeService: ThemeService,
  ) {
    const months = lastFourMonths();
    this.labels = months.map((m) => m.label);
    this.counts = months.map(() => 0);
    this.chartData.set(buildMonthlyBarChartData(this.labels, this.counts, DATASET_LABEL));
    this.chartOptions.set(buildMonthlyBarChartOptions());

    effect(() => {
      this.themeService.isDark();
      this.chartData.set(buildMonthlyBarChartData(this.labels, this.counts, DATASET_LABEL));
      this.chartOptions.set(buildMonthlyBarChartOptions());
    });
  }

  ngOnInit(): void {
    const months = lastFourMonths();
    const to = new Date();
    const from = new Date(to.getFullYear(), to.getMonth() - 3, 1);
    const toParam = to.toISOString().slice(0, 10);
    const fromParam = from.toISOString().slice(0, 10);

    this.orderService.getShippedOrdersMonthlyStats(fromParam, toParam).subscribe({
      next: (response) => {
        const countByMonth = new Map(response.data.map((s) => [s.month, s.count]));
        this.counts = months.map((m) => countByMonth.get(m.key) ?? 0);
        this.chartData.set(buildMonthlyBarChartData(this.labels, this.counts, DATASET_LABEL));
      },
      error: () => {
        // Keep the zero-filled chart visible if stats can't be loaded.
      },
    });
  }
}
