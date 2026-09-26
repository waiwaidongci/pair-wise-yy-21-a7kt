// 备件领用申请状态：待审批 / 已批准（已扣库存）/ 已驳回 / 已归还
export const PART_USAGE_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  RETURNED: "RETURNED"
} as const;

export type PartUsageStatus = (typeof PART_USAGE_STATUS)[keyof typeof PART_USAGE_STATUS];

export const PART_USAGE_STATUS_LIST: PartUsageStatus[] = [
  PART_USAGE_STATUS.PENDING,
  PART_USAGE_STATUS.APPROVED,
  PART_USAGE_STATUS.REJECTED,
  PART_USAGE_STATUS.RETURNED
];

export const PART_USAGE_STATUS_TEXT: Record<PartUsageStatus, string> = {
  PENDING: "待审批",
  APPROVED: "已批准",
  REJECTED: "已驳回",
  RETURNED: "已归还"
};
