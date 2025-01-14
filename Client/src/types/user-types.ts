export interface UserFromDB {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone_number?: string;
  created_at: Date;
  updated_at: Date;
}