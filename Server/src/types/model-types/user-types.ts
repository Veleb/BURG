export interface UserInterface {
  fullName: string
  username: string;
  email?: string;
  phoneNumber?: string;
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
  fullName: string
  username: string;
  email?: string;
  phoneNumber?: string;
  password: string;
}

export interface UserFromDB {
  _id: string;
  fullName: string
  username: string;
  email?: string;
  phoneNumber?: string;
  created_at: Date;
  updated_at: Date;
}