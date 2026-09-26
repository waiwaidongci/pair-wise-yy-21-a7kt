import { seed } from "../seed";
import type { AuthUser } from "../models/AuthUser";

const rows: AuthUser[] = structuredClone(seed.user) as unknown as AuthUser[];

export const userRepository = {
  findById(id: number): AuthUser | undefined {
    return rows.find((user) => user.id === id);
  },

  findAll(): AuthUser[] {
    return [...rows];
  }
};
