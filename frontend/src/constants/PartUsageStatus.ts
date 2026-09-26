export const PART_USAGE_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  RETURNED: "RETURNED"
} as const;

export type PartUsageStatus = (typeof PART_USAGE_STATUS)[keyof typeof PART_USAGE_STATUS];

export const PART_USAGE_STATUS_LIST = [
  PART_USAGE_STATUS.PENDING,
  PART_USAGE_STATUS.APPROVED,
  PART_USAGE_STATUS.REJECTED,
  PART_USAGE_STATUS.RETURNED
] as const;

export const PART_USAGE_STATUS_TEXT: Record<PartUsageStatus, string> = {
  PENDING: "待审批",
  APPROVED: "已批准",
  REJECTED: "已驳回",
  RETURNED: "已归还"
};
