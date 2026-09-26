import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { seed } from "../seed";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { unauthorized } from "../errors/AppError";
import type { AuthUser } from "../types/SparePartUsagePayload";

export const authService = {
  login(userId: number): { token: string; user: AuthUser } {
    const user = seed.users.find((item) => item.id === userId);
    if (!user) {
      throw unauthorized(ERROR_MESSAGES.AUTH_REQUIRED);
    }
    const token = jwt.sign({ ...user }, config.jwtSecret, { expiresIn: config.jwtExpiresIn as jwt.SignOptions["expiresIn"] });
    return { token, user };
  },
  listUsers(): AuthUser[] {
    return seed.users;
  }
};
