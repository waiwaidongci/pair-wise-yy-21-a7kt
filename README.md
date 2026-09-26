# 电力配网抢修工单系统

面向供电所的配网故障报修、抢修派工、备件领用和停电恢复跟踪平台。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20104>

后端健康检查：<http://localhost:21104/health>


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
- `JWT_SECRET/JWT_EXPIRES_IN`: JWT 签名密钥与有效期
- `RATE_LIMIT_MAX/RATE_LIMIT_WINDOW_MS`: 接口限流阈值（每 IP 固定窗口）

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: grid-repair`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-grid-repair}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- FaultType: constants/FaultType、types/FaultType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- TicketStatus: constants/TicketStatus、types/TicketStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- AssetHealthStatus: constants/AssetHealthStatus、types/AssetHealthStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- PartUsageStatus（备件申请状态 PENDING/APPROVED/REJECTED/RETURNED）:
  - 后端：`backend/src/constants/PartUsageStatus.ts`、`models/SparePartUsage.ts`、`types/SparePartUsagePayload.ts`、`constructors/SparePartUsageDtoFactory.ts`、`services/SparePartUsageService.ts`、`controllers/SparePartUsageController.ts`、`seed.ts`、`utils/formatters.ts`
  - 前端：`frontend/src/constants/PartUsageStatus.ts`、`constants/statusText.ts`、`types/SparePartUsage.ts`、`constructors/SparePartUsageConstructor.ts`、`stores/SparePartUsageStore.ts`、`pages/PartsPage.vue`、`components/common/ApprovalPanel.vue`、`components/common/StatusBadge.vue`、`mocks/seedData.ts`
- Roles（RBAC：DISPATCHER/TEAM_LEADER/WAREHOUSE_KEEPER/AUDITOR）:
  - 后端：`constants/Roles.ts`、`middlewares/authMiddleware.ts`、`middlewares/rbacMiddleware.ts`、`repositories/UserRepository.ts`、`controllers/AuthController.ts`、`seed.ts`
  - 前端：`constants/Roles.ts`、`utils/rbac.ts`、`stores/AuthStore.ts`、`api/Auth.ts`、`pages/LoginPage.vue`、`pages/PartsPage.vue`、`router/index.ts`
- StockFlow（库存流水 OUTBOUND/INBOUND/RETURN/ADJUST）: 后端 `constants/StockFlow.ts`、`models/StockLog.ts`、`constructors/StockLogDtoFactory.ts`、`services/SparePartStockService.ts`；前端 `constants/StockFlow.ts`、`types/StockLog.ts`、`pages/PartsPage.vue`。

## 备件领用审批台（RBAC 与库存规则）

- 仓管（WAREHOUSE_KEEPER）：可按工单、仓库、申请状态筛选待审批记录；批准前系统核对申请量与可用库存，库存不足会标明缺多少并保留「待审批」，库存充足批准后立即扣减库存并写入库存流水；驳回必须填写原因。
- 班组长（TEAM_LEADER）：只能查看本组（服务端强制 `team_id` 过滤）的记录，并为自己班组的工单提交材料申请；不能审批。
- 审计员（AUDITOR）：只读，可查看全部申请与库存流水，任何写操作返回 403 并直接说明原因。
- 调度员（DISPATCHER）：全局只读旁观。
- 审批结果（已批准/已驳回）、库存余量、审批人和审批时间、驳回原因都持久在申请记录上；越权请求统一返回 `RBAC_DENIED` 与中文原因（如"仅仓管可批准备件申请，当前身份为「审计员」，不能操作"）。
- 演示账号：201 李仓管、301/302 张/赵班长、401 周审计、101 王调度；`POST /api/auth/login {"user_id":201}` 签发 JWT，开发期也可用 `x-user-id` / `x-role` 请求头联调。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
