export const formatDate = (value: string | null) => (value ? new Date(value).toLocaleString("zh-CN") : "—");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

// 审批台：库存核对与余量展示
export const formatShortage = (shortage: number | null | undefined) =>
  shortage != null && shortage > 0 ? `缺 ${shortage} 件` : "库存充足";

export const formatQuantityDiff = (quantity: number) => `${quantity > 0 ? "+" : ""}${quantity}`;

export const formatApprover = (name: string, approvedAt: string | null) =>
  name && approvedAt ? `${name} · ${formatDate(approvedAt)}` : "—";
