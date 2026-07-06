const MONTH_NAMES = [
  'Јануар', 'Фебруар', 'Март', 'Април', 'Мај', 'Јун',
  'Јул', 'Август', 'Септембар', 'Октобар', 'Новембар', 'Децембар',
];

export interface MonthBucket {
  key: string;
  label: string;
}

export function lastFourMonths(): MonthBucket[] {
  const to = new Date();
  const months: MonthBucket[] = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(to.getFullYear(), to.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({ key, label: MONTH_NAMES[d.getMonth()] });
  }
  return months;
}

export function buildMonthlyBarChartData(labels: string[], counts: number[], datasetLabel: string) {
  const style = getComputedStyle(document.documentElement);
  const sage = style.getPropertyValue('--sage').trim();
  const sageDeep = style.getPropertyValue('--sage-deep').trim();

  return {
    labels,
    datasets: [
      {
        label: datasetLabel,
        data: counts,
        backgroundColor: sage,
        hoverBackgroundColor: sageDeep,
        borderRadius: 4,
        maxBarThickness: 48,
      },
    ],
  };
}

export function buildMonthlyBarChartOptions() {
  const style = getComputedStyle(document.documentElement);
  const ink = style.getPropertyValue('--ink').trim();
  const hair = style.getPropertyValue('--hair').trim();

  return {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
