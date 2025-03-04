export interface RentInterface {
  _id?: string;
  start: Date;
  end: Date;
  vehicle: string;
  user: string | null;    
  pickupLocation: string;
  dropoffLocation: string;
  status: 'pending' | 'confirmed' | 'canceled';
}
