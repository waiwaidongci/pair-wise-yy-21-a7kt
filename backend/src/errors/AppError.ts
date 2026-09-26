import { ERROR_CODES } from "../constants/errorCodes";

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: keyof typeof ERROR_CODES | string,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const badRequest = (code: keyof typeof ERROR_CODES, message: string) => new AppError(400, code, message);
export const unauthorized = (message: string) => new AppError(401, ERROR_CODES.AUTH_REQUIRED, message);
export const forbidden = (message: string) => new AppError(403, ERROR_CODES.RBAC_DENIED, message);
export const notFound = (code: keyof typeof ERROR_CODES, message: string) => new AppError(404, code, message);
