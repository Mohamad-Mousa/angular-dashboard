import { PrivilegeAccess } from '@shared/enums';

export interface FunctionList {
  functionName: string;
}

export interface Privilege {
  functionlist: FunctionList;
  [PrivilegeAccess.R]?: boolean;
  [PrivilegeAccess.W]?: boolean;
  [PrivilegeAccess.U]?: boolean;
  [PrivilegeAccess.D]?: boolean;
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
  accessToken: string;
  admin: Admin;
}
