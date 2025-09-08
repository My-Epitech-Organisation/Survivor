// types/project.ts
import { Founder } from "./founders";
import { Roles } from "./role";

export interface User {
  name: string;
  email: string;
  role: Roles;
  id: number;
  founderId?: number;
  startupId?: number;
  userImag?: string;
}

export interface UserSimple {
  name: string;
  email: string;
  role: Roles;
  id: number;
  founder?: Founder;
  userImag?: string;
}


export interface FormUser {
  name: string;
  email: string;
  role: Roles;
  founder?: Founder;
  userImag?: string;
}