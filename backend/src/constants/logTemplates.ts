// 日志模板集中存放，所有写操作都要引用对应模板，禁止在调用处散写
export const LOG_TEMPLATES = {
  GridAsset: ["GridAsset.create", "GridAsset.update", "GridAsset.status", "GridAsset.export"],
  FaultReport: ["FaultReport.create", "FaultReport.update", "FaultReport.status", "FaultReport.export"],
  RepairTicket: ["RepairTicket.create", "RepairTicket.update", "RepairTicket.status", "RepairTicket.export"],
  Crew: ["Crew.create", "Crew.update", "Crew.status", "Crew.export"],
  SparePartUsage: [
    "SparePartUsage.create",
    "SparePartUsage.update",
    "SparePartUsage.status",
    "SparePartUsage.export",
    "SparePartUsage.apply",
    "SparePartUsage.approve",
    "SparePartUsage.reject"
  ],
  SparePartStock: [
    "SparePartStock.create",
    "SparePartStock.update",
    "SparePartStock.outbound",
    "SparePartStock.adjust"
  ],
  Auth: ["Auth.login", "Auth.denied", "Auth.rateLimited"]
} as const;

export type LogTemplate =
  | (typeof LOG_TEMPLATES)[keyof typeof LOG_TEMPLATES][number];
