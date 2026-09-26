import { seed } from "../seed";

export const repairTicketRepository = {
  findAll: () => seed.repairTicket,
  findById: (id: number) => seed.repairTicket.find((ticket) => ticket.id === id),
  save: (row: unknown) => row
};
