import { useSessionStore } from "../stores/SessionStore";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** 统一请求封装：自动带 JWT，403/400 的后端消息直接抛出供页面“说明原因” */
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = useSessionStore();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {})
  };
  if (session.token) headers.Authorization = `Bearer ${session.token}`;

  let res: Response;
  try {
    res = await fetch(path, { ...options, headers });
  } catch {
    throw new ApiError(0, "NETWORK_OFFLINE", "网络不可用");
  }

  if (res.status === 401) {
    session.clear();
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, body.code ?? "INTERNAL_ERROR", body.message ?? "请求失败");
  }
  return body as T;
}
