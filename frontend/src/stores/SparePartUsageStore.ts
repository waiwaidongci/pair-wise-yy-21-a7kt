import { defineStore } from "pinia";
import {
  listSparePartUsage,
  applySparePartUsage,
  approveSparePartUsage,
  rejectSparePartUsage
} from "../api/SparePartUsage";
import type {
  SparePartUsageView,
  SparePartUsageQuery,
  CreateUsagePayload
} from "../types/SparePartUsage";

interface UsageFilter {
  ticket_id: number | undefined;
  warehouse_name: string;
  usage_status: string;
}

const emptyFilter = (): UsageFilter => ({ ticket_id: undefined, warehouse_name: "", usage_status: "PENDING" });

export const useSparePartUsageStore = defineStore("sparePartUsage", {
  state: () => ({
    rows: [] as SparePartUsageView[],
    loading: false,
    filter: emptyFilter()
  }),
  getters: {
    pendingRows: (state) => state.rows.filter((row) => row.usage_status === "PENDING"),
    shortageRows: (state) =>
      state.rows.filter((row) => row.usage_status === "PENDING" && row.current_shortage > 0)
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        const query: SparePartUsageQuery = {
          ticket_id: this.filter.ticket_id,
          warehouse_name: this.filter.warehouse_name || undefined,
          usage_status: this.filter.usage_status || undefined
        };
        this.rows = await listSparePartUsage(query);
      } finally {
        this.loading = false;
      }
    },

    setFilter(patch: Partial<UsageFilter>) {
      Object.assign(this.filter, patch);
      return this.load();
    },

    resetFilter() {
      this.filter = emptyFilter();
      return this.load();
    },

    async apply(payload: CreateUsagePayload) {
      const created = await applySparePartUsage(payload);
      await this.load();
      return created;
    },

    async approve(id: number) {
      const updated = await approveSparePartUsage(id);
      await this.load();
      return updated;
    },

    async reject(id: number, reason: string) {
      const updated = await rejectSparePartUsage(id, reason);
      await this.load();
      return updated;
    }
  }
});
