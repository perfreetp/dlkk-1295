import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Anomaly, ProcessingRecord, AlertLevel, AnomalyStatus, RuleType } from '../types';
import { anomalies as initialAnomalies, processingRecords as initialRecords } from '../data/mockData';

interface AnomalyFilters {
  shopId: string;
  type: RuleType | '';
  level: AlertLevel | '';
  status: AnomalyStatus | '';
  dateRange: { start: Date; end: Date } | null;
  searchKeyword: string;
}

interface AnomalyState {
  anomalies: Anomaly[];
  processingRecords: ProcessingRecord[];
  filters: AnomalyFilters;
  currentAnomalyId: string | null;
  setFilters: (filters: Partial<AnomalyFilters>) => void;
  resetFilters: () => void;
  getFilteredAnomalies: () => Anomaly[];
  getAnomalyById: (id: string) => Anomaly | undefined;
  updateAnomaly: (id: string, updates: Partial<Anomaly>) => void;
  assignAnomaly: (id: string, userId: string, userName: string) => void;
  resolveAnomaly: (id: string, resolution: string) => void;
  ignoreAnomaly: (id: string, reason: string) => void;
  changeAnomalyLevel: (id: string, level: AlertLevel) => void;
  addProcessingRecord: (record: Omit<ProcessingRecord, 'id' | 'createdAt'>) => void;
  getRecordsByAnomalyId: (anomalyId: string) => ProcessingRecord[];
  getPendingCount: () => number;
  getProcessingCount: () => number;
  getResolvedCount: () => number;
  getTodayAnomalies: () => Anomaly[];
}

const defaultFilters: AnomalyFilters = {
  shopId: '',
  type: '',
  level: '',
  status: '',
  dateRange: null,
  searchKeyword: '',
};

export const useAnomalyStore = create<AnomalyState>()(
  persist(
    (set, get) => ({
      anomalies: initialAnomalies,
      processingRecords: initialRecords,
      filters: defaultFilters,
      currentAnomalyId: null,
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },
      resetFilters: () => set({ filters: defaultFilters }),
      getFilteredAnomalies: () => {
        const { anomalies, filters } = get();
        return anomalies.filter((anomaly) => {
          if (filters.shopId && anomaly.shopId !== filters.shopId) return false;
          if (filters.type && anomaly.type !== filters.type) return false;
          if (filters.level && anomaly.level !== filters.level) return false;
          if (filters.status && anomaly.status !== filters.status) return false;
          if (filters.searchKeyword) {
            const keyword = filters.searchKeyword.toLowerCase();
            if (
              !anomaly.title.toLowerCase().includes(keyword) &&
              !anomaly.description.toLowerCase().includes(keyword)
            ) {
              return false;
            }
          }
          if (filters.dateRange) {
            const anomalyDate = new Date(anomaly.createdAt);
            if (
              anomalyDate < filters.dateRange.start ||
              anomalyDate > filters.dateRange.end
            ) {
              return false;
            }
          }
          return true;
        });
      },
      getAnomalyById: (id) => get().anomalies.find((a) => a.id === id),
      updateAnomaly: (id, updates) => {
        set((state) => ({
          anomalies: state.anomalies.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
          ),
        }));
      },
      assignAnomaly: (id, userId, userName) => {
        set((state) => ({
          anomalies: state.anomalies.map((a) =>
            a.id === id
              ? { ...a, assignee: userId, assigneeName: userName, status: 'processing', updatedAt: new Date() }
              : a
          ),
        }));
        get().addProcessingRecord({
          anomalyId: id,
          operator: userId,
          operatorName: userName,
          action: 'assigned',
          previousValue: '',
          newValue: userName,
          comment: `分配给${userName}处理`,
        });
      },
      resolveAnomaly: (id, resolution) => {
        const now = new Date();
        set((state) => ({
          anomalies: state.anomalies.map((a) =>
            a.id === id
              ? { ...a, status: 'resolved', resolution, handledAt: now, updatedAt: now }
              : a
          ),
        }));
        const anomaly = get().getAnomalyById(id);
        if (anomaly) {
          get().addProcessingRecord({
            anomalyId: id,
            operator: anomaly.assignee || 'system',
            operatorName: anomaly.assigneeName || '系统',
            action: 'resolved',
            previousValue: anomaly.status,
            newValue: 'resolved',
            comment: resolution,
          });
        }
      },
      ignoreAnomaly: (id, reason) => {
        set((state) => ({
          anomalies: state.anomalies.map((a) =>
            a.id === id
              ? { ...a, status: 'ignored', resolution: reason, handledAt: new Date(), updatedAt: new Date() }
              : a
          ),
        }));
      },
      changeAnomalyLevel: (id, level) => {
        const anomaly = get().getAnomalyById(id);
        if (anomaly) {
          get().addProcessingRecord({
            anomalyId: id,
            operator: anomaly.assignee || 'system',
            operatorName: anomaly.assigneeName || '系统',
            action: 'level_changed',
            previousValue: anomaly.level,
            newValue: level,
            comment: `修改级别为${level}`,
          });
        }
        set((state) => ({
          anomalies: state.anomalies.map((a) =>
            a.id === id ? { ...a, level, updatedAt: new Date() } : a
          ),
        }));
      },
      addProcessingRecord: (record) => {
        const newRecord: ProcessingRecord = {
          ...record,
          id: `proc-${Date.now()}`,
          createdAt: new Date(),
        };
        set((state) => ({
          processingRecords: [newRecord, ...state.processingRecords],
        }));
      },
      getRecordsByAnomalyId: (anomalyId) =>
        get().processingRecords.filter((r) => r.anomalyId === anomalyId),
      getPendingCount: () => get().anomalies.filter((a) => a.status === 'pending').length,
      getProcessingCount: () => get().anomalies.filter((a) => a.status === 'processing').length,
      getResolvedCount: () => get().anomalies.filter((a) => a.status === 'resolved').length,
      getTodayAnomalies: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return get().anomalies.filter((a) => new Date(a.createdAt) >= today);
      },
    }),
    {
      name: 'anomaly-storage',
      partialize: (state) => ({
        anomalies: state.anomalies,
        processingRecords: state.processingRecords,
      }),
    }
  )
);
