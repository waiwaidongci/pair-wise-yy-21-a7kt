export const STOCK_FLOW = {
  OUTBOUND: "OUTBOUND",
  INBOUND: "INBOUND",
  RETURN: "RETURN",
  ADJUST: "ADJUST"
} as const;

export type StockFlow = (typeof STOCK_FLOW)[keyof typeof STOCK_FLOW];

export const STOCK_FLOW_TEXT: Record<StockFlow, string> = {
  OUTBOUND: "审批出库",
  INBOUND: "入库",
  RETURN: "退料入库",
  ADJUST: "库存调整"
};
