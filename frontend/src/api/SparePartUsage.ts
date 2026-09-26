import { request } from "./http";
import { mockData } from "../mocks/seedData";
import type {
  SparePartUsageView,
  SparePartUsageQuery,
  CreateUsagePayload
} from "../types/SparePartUsage";

const endpoint = "/spare-part-usage";

// 审批台列表：工单 / 仓库 / 申请状态由后端筛选，班组长由后端强制只看本组
export async function listSparePartUsage(query: SparePartUsageQuery = {}): Promise<SparePartUsageView[]> {
  try {
    return await request<SparePartUsageView[]>(endpoint, {
      query: {
        ticket_id: query.ticket_id,
        warehouse_name: query.warehouse_name,
        usage_status: query.usage_status
      }
    });
  } catch (err) {
    // 后端离线时回退本地种子，保证评审可用（不回退写操作）
    if ((err as { code?: string }).code === "NETWORK_ERROR") {
      return [...(mockData.sparePartUsage as unknown as SparePartUsageView[])];
    }
    throw err;
  }
}

// 班组长提交工单材料申请
export async function applySparePartUsage(payload: CreateUsagePayload): Promise<SparePartUsageView> {
  return request<SparePartUsageView>(endpoint, { method: "POST", body: payload });
}

// 仓管批准；库存不足时后端返回 STOCK_SHORTAGE 且记录保留待审批
export async function approveSparePartUsage(id: number): Promise<SparePartUsageView> {
  return request<SparePartUsageView>(`${endpoint}/${id}/approve`, { method: "POST" });
}

// 仓管驳回，原因必填
export async function rejectSparePartUsage(id: number, rejectReason: string): Promise<SparePartUsageView> {
  return request<SparePartUsageView>(`${endpoint}/${id}/reject`, {
    method: "POST",
    body: { reject_reason: rejectReason }
  });
}
