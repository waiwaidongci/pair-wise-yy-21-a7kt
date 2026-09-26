import { mockData } from "../mocks/seedData";
import { request, ApiError } from "./http";
import type { DecisionResult, SparePartUsage, SparePartUsageFilters, SparePartUsageForm, SparePartUsageView } from "../types/SparePartUsage";

const endpoint = "/api/spare-part-usage";

const buildQuery = (filters: Partial<SparePartUsageFilters>): string => {
  const params = new URLSearchParams();
  if (filters.ticketId) params.set("ticketId", filters.ticketId);
  if (filters.warehouse) params.set("warehouse", filters.warehouse);
  if (filters.status) params.set("status", filters.status);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

/** 待审批记录查询：按工单、仓库、申请状态筛选；班组长在后端自动限本组 */
export async function listSparePartUsage(filters: Partial<SparePartUsageFilters> = {}): Promise<SparePartUsageView[]> {
  try {
    return await request<SparePartUsageView[]>(`${endpoint}${buildQuery(filters)}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 0) {
      // 离线评审兜底：本地种子只读，任何写操作仍必须走后端
      return [...(mockData.sparePartUsage as unknown as SparePartUsageView[])];
    }
    throw err;
  }
}

export function listWarehouses(): Promise<string[]> {
  return request<string[]>(`${endpoint}/warehouses`);
}

/** 班组长提交申请 */
export function applySparePartUsage(form: SparePartUsageForm): Promise<SparePartUsageView> {
  return request<SparePartUsageView>(endpoint, {
    method: "POST",
    body: JSON.stringify(form)
  });
}

/** 仓管批准：库存不足时 HTTP 202 返回 warning，记录保留待审批 */
export function approveSparePartUsage(id: number): Promise<DecisionResult> {
  return request<DecisionResult>(`${endpoint}/${id}/approve`, { method: "POST" });
}

/** 仓管驳回：reason 必填（后端强制） */
export function rejectSparePartUsage(id: number, reason: string): Promise<SparePartUsage> {
  return request<SparePartUsage>(`${endpoint}/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason })
  });
}
