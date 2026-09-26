import type { Role } from "../constants/Role";

export interface AuthUser {
  id: number;
  name: string;
  role: Role;
  teamId?: number;
}

export interface SparePartUsageQuery {
  ticketId?: number;
  warehouse?: string;
  status?: string;
}

export interface ApprovePayload {
  force?: boolean;
}

export interface RejectPayload {
  reason: string;
}
