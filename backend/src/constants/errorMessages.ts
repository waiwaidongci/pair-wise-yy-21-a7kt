export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "缺少登录凭证，请先登录后再操作",
  RBAC_DENIED: "越权请求：{reason}（当前角色：{role}）",
  VALIDATION_FAILED: "表单字段缺失或格式错误：{field}",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  NOT_FOUND: "{entity}不存在：{id}",
  REASON_REQUIRED: "驳回备件领用必须填写驳回原因",
  APPROVAL_STATE_INVALID: "只有待审批状态的记录才能执行审批，当前状态：{status}",
  TEAM_SCOPE_DENIED: "班组长只能查看和提交本班组（{teamId}）工单的备件申请",
  STOCK_SHORTAGE: "可用库存不足，尚缺 {shortage} 件，该申请保留待审批",
  UNKNOWN_PART: "仓库 {warehouse} 中不存在备件 {partCode}，请先由仓管建库存",
  UNKNOWN_TICKET: "工单不存在或不属于本班组：{ticketId}"
} as const;
