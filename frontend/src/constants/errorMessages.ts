export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "未提供身份凭证，请先选择登录身份",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  NOT_FOUND: "目标记录不存在",
  STOCK_SHORTAGE: "可用库存不足，申请已保留待审批",
  STATUS_CONFLICT: "该申请已处理，请勿重复审批",
  REASON_REQUIRED: "驳回时必须填写驳回原因",
  INTERNAL_ERROR: "接口处理异常，请稍后再试",
  NETWORK_ERROR: "后端连接失败，当前展示本地种子数据"
} as const;
