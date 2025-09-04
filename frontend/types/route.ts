import { Roles } from "./role";

export interface RouteRoles {
  route: string;
  rolesAuth?: Roles[];
}
