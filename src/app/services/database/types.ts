export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isAdmin?: boolean;
}

export interface Location {
  address: string;
  type: string;
  longitude: number;
  latitude: number;
  symbol: string;
  title: string;
}
