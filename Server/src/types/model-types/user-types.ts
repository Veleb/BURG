export interface UserInterface {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone_number?: string;
  password: string;
  
  _id: string;
  created_at: Date;
  updated_at: Date;
}

export interface userForLogin {
  username: string;
  password: string;
}

export interface UserForAuth {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone_number?: string;
  password: string;
}

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