export interface CompanyInterface {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  vehicles: number;
  owner: string;
  status: 'pending' | 'confirmed' | 'canceled';
}