import { defineStore } from "pinia";
import {
  applySparePartUsage,
  approveSparePartUsage,
  listSparePartUsage,
  listWarehouses,
  rejectSparePartUsage
} from "../api/SparePartUsage";
import type {
  DecisionResult,
  SparePartUsageFilters,
  SparePartUsageForm,
  SparePartUsageView
} from "../types/SparePartUsage";

interface State {
  rows: SparePartUsageView[];
  warehouses: string[];
  loading: boolean;
  filters: SparePartUsageFilters;
  acting: boolean;
  /** 最近一次库存不足提示（记录仍留在待审批） */
  shortageNotice: string;
}

export const useSparePartUsageStore = defineStore("sparePartUsage", {
  state: (): State => ({
    rows: [],
    warehouses: [],
    loading: false,
    filters: { ticketId: "", warehouse: "", status: "PENDING" },
    acting: false,
    shortageNotice: ""
  }),
  getters: {
    pendingRows: (state) => state.rows.filter((row) => row.usage_status === "PENDING"),
    approvedRows: (state) => state.rows.filter((row) => row.usage_status === "APPROVED"),
    rejectedRows: (state) => state.rows.filter((row) => row.usage_status === "REJECTED")
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listSparePartUsage(this.filters);
        if (this.warehouses.length === 0) {
          this.warehouses = await listWarehouses().catch(() => []);
        }
      } finally {
        this.loading = false;
      }
    },
    setFilters(patch: Partial<SparePartUsageFilters>) {
      this.filters = { ...this.filters, ...patch };
      return this.load();
    },
    resetFilters() {
      this.filters = { ticketId: "", warehouse: "", status: "" };
      return this.load();
    },
    async submitApply(form: SparePartUsageForm): Promise<SparePartUsageView> {
      const created = await applySparePartUsage(form);
      await this.load();
      return created;
    },
    async approve(id: number): Promise<DecisionResult> {
      this.acting = true;
      this.shortageNotice = "";
      try {
        const result = await approveSparePartUsage(id);
        if (result.warning) this.shortageNotice = `#${id} ${result.warning}`;
        await this.load();
        return result;
      } finally {
        this.acting = false;
      }
    },
    async reject(id: number, reason: string) {
      this.acting = true;
      try {
        const row = await rejectSparePartUsage(id, reason);
        await this.load();
        return row;
      } finally {
        this.acting = false;
      }
    }
  }
});
