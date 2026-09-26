import { ERROR_CODES } from "../constants/errorCodes";
import type { ErrorCode } from "../constants/errorCodes";

// service / controller 都通过该错误包装异常，禁止只在全局中间件吞掉
export class AppError extends Error {
  status: number;
  code: ErrorCode;
  detail?: string;

  constructor(status: number, code: ErrorCode, message: string, detail?: string) {
    super(detail ? `${message}：${detail}` : message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

export const badRequest = (message: string, code: ErrorCode = ERROR_CODES.VALIDATION_FAILED, detail?: string) =>
  new AppError(400, code, message, detail);

export const unauthorized = (detail?: string) =>
  new AppError(401, ERROR_CODES.AUTH_REQUIRED, "未提供身份凭证，请先登录", detail);

export const forbidden = (detail?: string) =>
  new AppError(403, ERROR_CODES.RBAC_DENIED, "当前角色没有执行该动作的权限", detail);

export const notFound = (detail?: string) =>
  new AppError(404, ERROR_CODES.NOT_FOUND, "目标记录不存在", detail);

export const conflict = (message: string, code: ErrorCode = ERROR_CODES.STATUS_CONFLICT, detail?: string) =>
  new AppError(409, code, message, detail);
