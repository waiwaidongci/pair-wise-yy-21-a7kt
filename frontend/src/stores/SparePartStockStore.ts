import { defineStore } from "pinia";
import { listSparePartStock, listStockLogs } from "../api/SparePartStock";
import type { SparePartStock } from "../types/SparePartStock";
import type { StockLog } from "../types/StockLog";

export const useSparePartStockStore = defineStore("sparePartStock", {
  state: () => ({
    stocks: [] as SparePartStock[],
    logs: [] as StockLog[],
    loading: false
  }),
  getters: {
    warehouses: (state) => [...new Set(state.stocks.map((row) => row.warehouse_name))]
  },
  actions: {
    async loadStocks(warehouseName?: string) {
      this.loading = true;
      try {
        this.stocks = await listSparePartStock(warehouseName);
      } finally {
        this.loading = false;
      }
    },
    async loadLogs() {
      this.logs = await listStockLogs();
    }
  }
});
