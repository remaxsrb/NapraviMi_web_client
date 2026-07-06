export interface LineChartSeries {
  label: string;
  data: number[];
  color: string;
}

export function buildMonthlyLineChartData(labels: string[], series: LineChartSeries[]) {
  return {
    labels,
    datasets: series.map((s) => ({
      label: s.label,
      data: s.data,
      borderColor: s.color,
      backgroundColor: s.color,
      pointBackgroundColor: s.color,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2,
      tension: 0,
      fill: false,
    })),
  };
}

export function buildMonthlyLineChartOptions() {
  const style = getComputedStyle(document.documentElement);
  const ink = style.getPropertyValue('--ink').trim();
  const hair = style.getPropertyValue('--hair').trim();

  return {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: { color: ink, usePointStyle: true },
      },
    },
    scales: {
      x: {
        ticks: { color: ink },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: ink, stepSize: 1 },
        grid: { color: hair },
      },
    },
  };
}
