export interface ApiUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

export interface RoleOption {
  label: string;
  value: string;
}

export interface UserRoleRow {
  id: number;
  email: string;
  username: string;
  fullName: string;
  role: string;
  newRole: string;
  createdAt?: Date;
}

export interface GetUsersResponse {
  users: ApiUser[];
  total?: number;
  page?: number;
}
