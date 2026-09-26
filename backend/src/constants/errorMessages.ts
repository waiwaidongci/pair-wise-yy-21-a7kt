export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "未提供身份凭证，请先登录或在请求头中携带 x-role / x-user-id",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  NOT_FOUND: "目标记录不存在",
  STOCK_SHORTAGE: "可用库存不足，无法批准出库",
  STATUS_CONFLICT: "该申请已处理，请勿重复审批",
  REASON_REQUIRED: "驳回时必须填写驳回原因"
} as const;

export type ErrorMessage = (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES];
