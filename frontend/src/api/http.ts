import type { ApiErrorBody } from "../types/ApiError";
import { ERROR_CODES } from "../constants/errorCodes";

export class ApiError extends Error {
  status: number;
  code: string;
  detail?: string;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.status = status;
    this.code = body.code;
    this.detail = body.detail;
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
}

const buildQuery = (query?: RequestOptions["query"]) => {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  });
  const text = params.toString();
  return text ? `?${text}` : "";
};

// 统一请求封装：自动携带 JWT / 开发联调头，401/403/409 等抛出带 code 的 ApiError
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem("grid-repair-token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    // 未登录时回退开发头，由后端做 x-user-id 直连
    const devUser = localStorage.getItem("grid-repair-dev-user");
    if (devUser) {
      const user = JSON.parse(devUser) as { id: number; role: string; team_id: number | null };
      headers["x-user-id"] = String(user.id);
      headers["x-role"] = user.role;
      if (user.team_id != null) headers["x-team-id"] = String(user.team_id);
    }
  }

  let res: Response;
  try {
    res = await fetch(`/api${path}${buildQuery(options.query)}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined
    });
  } catch {
    throw new ApiError(0, { code: ERROR_CODES.NETWORK_ERROR, message: "无法连接后端服务" });
  }

  if (!res.ok) {
    let body: ApiErrorBody = { code: "UNKNOWN", message: `请求失败（${res.status}）` };
    try {
      body = (await res.json()) as ApiErrorBody;
    } catch {
      // 非 JSON 错误响应保留默认文案
    }
    throw new ApiError(res.status, body);
  }
  return (await res.json()) as T;
}
