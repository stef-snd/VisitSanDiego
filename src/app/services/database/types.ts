export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isAdmin?: boolean;
}

export interface Location {
  locationLat: number;
  locationLong: number;
  userId: string;
  description: string;
  locationName: string;
  type: string;
}
