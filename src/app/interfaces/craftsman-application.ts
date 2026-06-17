export interface ApiApplication {
  id: number;
  email: string;
  status: string;
  craft: string;
  created_at: string;
  resolved_at?: string;
}

export interface StatusOption {
  label: string;
  value: string;
}

export interface ApplicationRow {
  id: number;
  email: string;
  craft: string;
  craftLabel: string;
  status: string;
  newStatus: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface GetApplicationsResponse {
  data: {
    craftsman_applications: ApiApplication[];
    total: number;
  };
}

export interface StatusChangeEvent {
  value?: string;
}
