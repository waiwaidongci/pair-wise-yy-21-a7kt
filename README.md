# 电力配网抢修工单系统

面向供电所的配网故障报修、抢修派工、备件领用和停电恢复跟踪平台。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20104>

后端健康检查：<http://localhost:21104/health>

### 演示账号（登录页一键切换，换取 JWT）

| 角色 | 账号 user_id | 姓名 | 在备件审批台的权限 |
|---|---|---|---|
| 仓管 WAREHOUSE_KEEPER | 21 | 陈仓管 | 查看全部申请，按工单/仓库/状态筛选，批准、驳回 |
| 班组长 TEAM_LEADER | 11 / 12 / 13 | 李/赵/孙班长（1/2/3 组） | 只看本组工单的申请，可提交申请，不能审批 |
| 审计员 AUDITOR | 31 | 周审计 | 只读，不能提交/批准/驳回，可查操作日志 |
| 调度员 DISPATCHER | 1 | 王调度 | 不开放备件审批台（越权返回 403 并说明原因） |

### 备件领用审批台规则（`/parts`）

- 待审批记录支持按**工单**（`ticketId`）、**仓库**（`warehouse`）、**申请状态**（`status=PENDING/APPROVED/REJECTED`）组合筛选。
- **批准前核对申请量与可用库存**：库存充足才扣减库存并置为已批准；库存不足时标明缺口（`shortage_quantity`、`stock_short`），记录**保留待审批**、不扣库存，接口返回 `202` 与 `warning`。
- **驳回必须填写原因**（`reject_reason`，空原因返回 `REASON_REQUIRED`）。
- 审批结果、扣减后的库存余量（`stock_after_approval`）、审批人与审批时间都留在记录上；申请/批准/驳回/库存不足均写入操作日志（`/api/audit-log`）。
- 越权请求（班组长/审计员/调度员调用审批或跨组访问）统一返回 `403 RBAC_DENIED`，消息中直接写明原因。

接口：

```bash
# 登录
curl -X POST http://localhost:21104/api/auth/login -H 'Content-Type: application/json' -d '{"user_id":21}'
# 列表（带筛选）
curl "http://localhost:21104/api/spare-part-usage?ticketId=101&warehouse=中心仓库&status=PENDING" -H "Authorization: Bearer <token>"
# 批准 / 驳回
curl -X POST http://localhost:21104/api/spare-part-usage/3/approve -H "Authorization: Bearer <token>"
curl -X POST http://localhost:21104/api/spare-part-usage/1/reject -H "Authorization: Bearer <token>" -H 'Content-Type: application/json' -d '{"reason":"型号不符"}'
# 库存台账 / 操作日志
curl http://localhost:21104/api/spare-part-stock -H "Authorization: Bearer <token>"
curl http://localhost:21104/api/audit-log -H "Authorization: Bearer <token>"
```


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Element Plus + Pinia |
| 后端 | Node.js + Express + TypeScript + Prisma |
| 数据库 | MySQL 8.0 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `grid-repair`
- `FRONTEND_PORT`: 前端端口，默认 `20104`
- `BACKEND_PORT`: 后端端口，默认 `21104`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据
- `JWT_SECRET/JWT_EXPIRES_IN`: 登录令牌签名密钥与有效期（默认 `local-dev-secret` / `8h`）
- `VITE_API_TARGET`: 仅本地 `npm run dev` 时使用，前端 `/api` 的代理目标（默认 `http://localhost:21104`；Docker 下由 nginx 代理到 `backend:3000`）

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: grid-repair`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-grid-repair}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- FaultType: constants/FaultType、types/FaultType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- TicketStatus: constants/TicketStatus、types/TicketStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- AssetHealthStatus: constants/AssetHealthStatus、types/AssetHealthStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- **PartUsageStatus（PENDING/APPROVED/REJECTED，备件申请状态）**：
  - 后端：`constants/PartUsageStatus.ts`（枚举+中文文案）、`models/SparePartUsage.ts`（字段类型）、`seed.ts`（种子状态）、`repositories/SparePartUsageRepository.ts`（状态筛选/默认 PENDING）、`services/SparePartUsageService.ts`（批准/驳回/状态校验）、`controllers/SparePartUsageController.ts`（query 校验）、`constants/logTemplates.ts`、`constants/errorCodes.ts`/`errorMessages.ts`（APPROVAL_STATE_INVALID/STOCK_SHORTAGE/REASON_REQUIRED）、`database/init.sql`（列默认值/注释）。
  - 前端：`constants/PartUsageStatus.ts`、`types/SparePartUsage.ts`、`constructors/SparePartUsageConstructor.ts`（默认 PENDING）、`stores/SparePartUsageStore.ts`、`api/SparePartUsage.ts`（状态筛选参数）、`components/common/PartStatusBadge.vue`、`components/common/ApprovalTable.vue`、`components/common/RejectDialog.vue`、`pages/PartsPage.vue`（状态筛选器与统计）、`mocks/seedData.ts`、`constants/logTemplates.ts`/`errorCodes.ts`/`errorMessages.ts`。
- **Role（DISPATCHER/TEAM_LEADER/WAREHOUSE_KEEPER/AUDITOR，RBAC 角色）**：
  - 后端：`constants/Role.ts`、`types/SparePartUsagePayload.ts`（AuthUser）、`middlewares/authMiddleware.ts`、`middlewares/rbacMiddleware.ts`、`routes/SparePartUsageRoutes.ts`、`routes/SparePartStockRoutes.ts`、`routes/AuditLogRoutes.ts`、`services/SparePartUsageService.ts`（班组长只看本组/只为本组申请）、`services/AuthService.ts`、`seed.ts`（用户种子）、`database/init.sql`（app_user 表）。
  - 前端：`constants/Role.ts`、`stores/SessionStore.ts`（canApprove/canApply/readOnly/路由 guard）、`router/routes.ts`（路由守卫）、`api/http.ts`（携带 JWT）、`pages/LoginPage.vue`、`pages/PartsPage.vue`、`App.vue`（身份与只读标识）、组件按钮显隐（`ApprovalTable.vue`、`PartApplyForm.vue`）。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
