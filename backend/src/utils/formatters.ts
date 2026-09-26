import { PART_USAGE_STATUS_TEXT } from "../constants/PartUsageStatus";

export const toAuditTarget = (type: string, id: string | number) => `${type}#${id}`;

// 缺量文案：库存不足时在记录上标明缺多少
export const formatShortage = (shortage: number | null | undefined) =>
  shortage != null && shortage > 0 ? `缺 ${shortage} 件` : "库存充足";

export const formatUsageStatus = (status: string) =>
  (PART_USAGE_STATUS_TEXT as Record<string, string>)[status] ?? status;

export const formatQuantityDiff = (quantity: number) =>
  `${quantity > 0 ? "+" : ""}${quantity}`;
