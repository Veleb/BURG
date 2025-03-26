export interface RentInterface {
  _id?: string;
  start: Date;
  end: Date;
  vehicle: string;
  user: string | null;    
  pickupLocation: string;
  dropoffLocation: string;
  status: 'pending' | 'confirmed' | 'canceled';
  total: number,
}

export interface FilterState {
  status: string;
  sort: {
    key: 'price' | 'startDate' | 'endDate' | 'none';
    direction: 'asc' | 'desc';
  };
  startDate: Date | null;
  endDate: Date | null;
}