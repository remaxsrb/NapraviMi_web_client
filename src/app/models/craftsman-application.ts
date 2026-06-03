export enum CraftsmanStatus {
  Pending = 'pending',
  Rejected = 'rejected',
  Accepted = 'accepted',
}

export class CraftsmanApplication {
  id: number = 0;
  email: string = '';
  status: CraftsmanStatus = CraftsmanStatus.Pending;
  createdAt: Date = new Date();
  resolvedAt?: Date;
}