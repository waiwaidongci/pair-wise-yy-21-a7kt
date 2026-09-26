import { seed } from "../seed";
import type { RepairTicket } from "../models/RepairTicket";

const rows: RepairTicket[] = structuredClone(seed.repairTicket) as unknown as RepairTicket[];

export const repairTicketRepository = {
  findAll: () => [...rows],
  save: (row: unknown) => row,
  findById(id: number): RepairTicket | undefined {
    return rows.find((ticket) => ticket.id === id);
  }
};
