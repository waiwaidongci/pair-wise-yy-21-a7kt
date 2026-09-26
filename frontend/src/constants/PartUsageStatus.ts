export const PART_USAGE_STATUS = ["PENDING", "APPROVED", "REJECTED"] as const;
export type PartUsageStatus = (typeof PART_USAGE_STATUS)[number];

export const PartUsageStatusText: Record<PartUsageStatus, string> = {
  PENDING: "待审批",
  APPROVED: "已批准",
  REJECTED: "已驳回"
};
