import type { Request } from "express";
import type { AuthUser } from "../types/SparePartUsagePayload";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export type AuthedRequest = Request & { user: AuthUser };
