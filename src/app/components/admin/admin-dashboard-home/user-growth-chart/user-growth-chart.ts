import { Component, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserService } from '../../../../services/user/user-service';
import { CraftsmanService } from '../../../../services/craftsman/craftsman-service';
import { ThemeService } from '../../../../services/utils/theme-service';
import { lastNMonths } from '../../../common/charts/monthly-bar-chart';
import { buildMonthlyLineChartData, buildMonthlyLineChartOptions } from '../../../common/charts/monthly-line-chart';

const MONTHS_TO_SHOW = 6;
const USERS_LABEL = 'Нови корисници';
const CRAFTSMEN_LABEL = 'Одобрене занатлије';

@Component({
  selector: 'app-user-growth-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './user-growth-chart.html',
  styleUrl: './user-growth-chart.css',
})
export class UserGrowthChart implements OnInit {
  readonly chartData = signal<any>(undefined);
  readonly chartOptions = signal<any>(undefined);

  private labels: string[] = [];
  private userCounts: number[] = [];
  private craftsmenCounts: number[] = [];

  constructor(
    private userService: UserService,
    private craftsmanService: CraftsmanService,
    private themeService: ThemeService,
  ) {
    const months = lastNMonths(MONTHS_TO_SHOW);
    this.labels = months.map((m) => m.label);
    this.userCounts = months.map(() => 0);
    this.craftsmenCounts = months.map(() => 0);
    this.chartData.set(this.buildData());
    this.chartOptions.set(buildMonthlyLineChartOptions());

    effect(() => {
      this.themeService.isDark();
      this.chartData.set(this.buildData());
      this.chartOptions.set(buildMonthlyLineChartOptions());
    });
  }

  ngOnInit(): void {
    const months = lastNMonths(MONTHS_TO_SHOW);

    const perMonth = months.map((m) =>
      forkJoin({
        users: this.userService.getRegisteredCount(m.from, m.to).pipe(
          map((r) => r.data.total),
          catchError(() => of(0)),
        ),
        craftsmen: this.craftsmanService.getApprovedCount(m.from, m.to).pipe(
          map((r) => r.data.total),
          catchError(() => of(0)),
        ),
      }),
    );

    forkJoin(perMonth).subscribe((results) => {
      this.userCounts = results.map((r) => r.users);
      this.craftsmenCounts = results.map((r) => r.craftsmen);
      this.chartData.set(this.buildData());
    });
  }

  private buildData() {
    const style = getComputedStyle(document.documentElement);
    const sage = style.getPropertyValue('--sage').trim();
    const red = style.getPropertyValue('--red').trim();

    return buildMonthlyLineChartData(this.labels, [
      { label: USERS_LABEL, data: this.userCounts, color: sage },
      { label: CRAFTSMEN_LABEL, data: this.craftsmenCounts, color: red },
    ]);
  }
}
