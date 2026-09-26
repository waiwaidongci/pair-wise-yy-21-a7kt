import { request } from "./http";
import type { SessionUser } from "../constants/Role";

interface LoginResponse {
  token: string;
  user: SessionUser;
}

export function login(userId: number): Promise<LoginResponse> {
  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ user_id: userId })
  });
}

export function listUsers(): Promise<SessionUser[]> {
  return request<SessionUser[]>("/api/auth/users");
}
