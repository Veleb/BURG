export interface RentInterface {
  _id?: string;
  start: Date;
  end: Date;
  vehicle: string;
  user: string | null;    
  location: string;
  status: 'pending' | 'confirmed' | 'canceled';
}
