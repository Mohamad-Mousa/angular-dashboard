export interface Function {
  _id: string;
  name: string;
  key: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Privilege {
  _id: string;
  function: Function;
  adminType: string;
  read: boolean;
  write: boolean;
  update: boolean;
  delete: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Admin {
  id?: string | number;
  email?: string;
  name?: string;
  [key: string]: any;
}

export interface User {
  id?: string | number;
  email?: string;
  name?: string;
  [key: string]: any;
}

export interface UserAuthenticated {
  admin: Admin;
  accessToken: string;
  refreshToken: string;
  privileges: Privilege[];
}
