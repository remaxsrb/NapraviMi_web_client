export class User {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  profilePicture: string;
  gender: string;
  role: string;

  constructor(data?: Partial<User>) {
    this.id = data?.id ?? 0;
    this.firstname = data?.firstname ?? '';
    this.lastname = data?.lastname ?? '';
    this.username = data?.username ?? '';
    this.email = data?.email ?? '';
    this.profilePicture = data?.profilePicture ?? '';
    this.gender = data?.gender ?? '';
    this.role = data?.role ?? '';
  }
}

export class RegularUser extends User {
  constructor(data?: Partial<RegularUser>) {
    super(data);
  }
}

export class Craftsman extends User {
  craft: string;
  rating: number;
  numberOfRatings: number;

  constructor(data?: Partial<Craftsman>) {
    super(data);

    this.craft = data?.craft ?? '';
    this.rating = data?.rating ?? 0;
    this.numberOfRatings = data?.numberOfRatings ?? 0;
  }
}
