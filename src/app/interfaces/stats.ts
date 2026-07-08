export interface MonthlyCountBucket {
  month: string; // "YYYY-MM"
  total: number;
}

export interface MonthlyCountResponse {
  data: {
    buckets: MonthlyCountBucket[];
  };
}
