export interface PaginationEvent {
  first: number;
  rows: number;
}

export interface LazyLoadEvent {
  first?: number | null;
  rows?: number | null;
}
