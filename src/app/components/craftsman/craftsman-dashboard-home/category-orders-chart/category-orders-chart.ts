import { Component, effect, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ThemeService } from '../../../../services/utils/theme-service';
import { CategoryOrderCount } from '../../../../interfaces/order';

const DATASET_LABEL = 'Број поруџбина';
const MIN_HEIGHT_PX = 160;
const ROW_HEIGHT_PX = 40;

@Component({
  selector: 'app-category-orders-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './category-orders-chart.html',
  styleUrl: './category-orders-chart.css',
})
export class CategoryOrdersChart {
  readonly categoryCounts = input<CategoryOrderCount[]>([]);

  readonly chartData = signal<any>(undefined);
  readonly chartOptions = signal<any>(undefined);
  readonly chartHeight = signal<string>(`${MIN_HEIGHT_PX}px`);

  constructor(private themeService: ThemeService) {
    this.chartData.set(this.buildData([]));
    this.chartOptions.set(this.buildOptions());

    effect(() => {
      const sorted = [...this.categoryCounts()].sort((a, b) => b.count - a.count);
      this.themeService.isDark();

      this.chartData.set(this.buildData(sorted));
      this.chartOptions.set(this.buildOptions());
      this.chartHeight.set(`${Math.max(MIN_HEIGHT_PX, sorted.length * ROW_HEIGHT_PX)}px`);
    });
  }

  private buildData(sorted: CategoryOrderCount[]) {
    const style = getComputedStyle(document.documentElement);
    const sage = style.getPropertyValue('--sage').trim();
    const sageDeep = style.getPropertyValue('--sage-deep').trim();

    return {
      labels: sorted.map((c) => c.category),
      datasets: [
        {
          label: DATASET_LABEL,
          data: sorted.map((c) => c.count),
          backgroundColor: sage,
          hoverBackgroundColor: sageDeep,
          borderRadius: 4,
          maxBarThickness: 24,
        },
      ],
    };
  }

  private buildOptions() {
    const style = getComputedStyle(document.documentElement);
    const ink = style.getPropertyValue('--ink').trim();
    const hair = style.getPropertyValue('--hair').trim();

    return {
      indexAxis: 'y' as const,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { color: ink, stepSize: 1 },
          grid: { color: hair },
        },
        y: {
          ticks: { color: ink },
          grid: { display: false },
        },
      },
    };
  }
}
