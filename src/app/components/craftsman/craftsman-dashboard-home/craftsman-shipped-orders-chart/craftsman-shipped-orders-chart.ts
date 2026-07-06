import { Component, effect, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ThemeService } from '../../../../services/utils/theme-service';
import { buildMonthlyBarChartData, buildMonthlyBarChartOptions, lastFourMonths } from '../../../common/charts/monthly-bar-chart';
import { OrderResponse } from '../../../../interfaces/order';

const DATASET_LABEL = 'Испоручене поруџбине';

@Component({
  selector: 'app-craftsman-shipped-orders-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './craftsman-shipped-orders-chart.html',
  styleUrl: './craftsman-shipped-orders-chart.css',
})
export class CraftsmanShippedOrdersChart {
  readonly orders = input<OrderResponse[]>([]);

  readonly chartData = signal<any>(undefined);
  readonly chartOptions = signal<any>(undefined);

  private labels = lastFourMonths().map((m) => m.label);

  constructor(private themeService: ThemeService) {
    this.chartData.set(buildMonthlyBarChartData(this.labels, this.labels.map(() => 0), DATASET_LABEL));
    this.chartOptions.set(buildMonthlyBarChartOptions());

    effect(() => {
      const orders = this.orders();
      this.themeService.isDark();

      const months = lastFourMonths();
      const countByMonth = new Map<string, number>();

      for (const order of orders) {
        if ((order.status ?? '').trim().toUpperCase() !== 'SHIPPED') continue;

        const date = new Date(order.completion_date ?? order.order_date);
        if (Number.isNaN(date.getTime())) continue;

        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        countByMonth.set(key, (countByMonth.get(key) ?? 0) + 1);
      }

      const counts = months.map((m) => countByMonth.get(m.key) ?? 0);
      this.chartData.set(buildMonthlyBarChartData(this.labels, counts, DATASET_LABEL));
      this.chartOptions.set(buildMonthlyBarChartOptions());
    });
  }
}
