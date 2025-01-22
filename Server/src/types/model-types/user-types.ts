export interface UserInterface {
  fullName: string
  email: string;
  phoneNumber?: string;
  password: string;
  
  _id: string;
  created_at: Date;
  updated_at: Date;
}

export interface userForLogin {
  password: string;
  email: string;
}

export interface UserForAuth {
  fullName: string
  email: string;
  phoneNumber?: string;
  password: string;
}

export interface UserFromDB {
  _id: string;
  fullName: string
  email: string;
  phoneNumber?: string;
  created_at: Date;
  updated_at: Date;
}