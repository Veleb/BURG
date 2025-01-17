export interface UserFromDB {
  _id: string;
  fullName: string,
  username: string;
  email: string;
  phoneNumber?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserForLogin {
  username: string,
  password: string,
}

export interface UserForRegister {
  fullName: string,
  username: string;
  email: string;
  phoneNumber?: string;  
}