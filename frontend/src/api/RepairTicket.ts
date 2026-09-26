import { request } from "./http";
import type { RepairTicket } from "../types/RepairTicket";

export async function listRepairTicket(): Promise<RepairTicket[]> {
  return request<RepairTicket[]>("/repair-ticket");
}

export async function saveRepairTicket(payload: RepairTicket) {
  console.info("save RepairTicket", payload);
  return payload;
}
