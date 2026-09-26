import type { Role } from "../constants/Roles";

export interface AuthUser {
  id: number;
  name: string;
  role: Role | string;
  team_id: number | null;
  role_text?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
