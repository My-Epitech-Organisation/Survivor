// types/project.ts
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


export interface FormUser {
  name: string;
  email: string;
  role: Roles;
  founderId?: number;
  startupId?: number;
  userImag?: string;
}