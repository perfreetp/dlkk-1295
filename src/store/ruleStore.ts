import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { InspectionRule, RuleType, AlertLevel } from '../types';
import { inspectionRules as initialRules } from '../data/mockData';

interface RuleState {
  rules: InspectionRule[];
  addRule: (rule: Omit<InspectionRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRule: (id: string, updates: Partial<InspectionRule>) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;
  getRuleById: (id: string) => InspectionRule | undefined;
  getEnabledRules: () => InspectionRule[];
  getRuleByType: (type: RuleType) => InspectionRule | undefined;
}

export const useRuleStore = create<RuleState>()(
  persist(
    (set, get) => ({
      rules: initialRules,
      addRule: (ruleData) => {
        const newRule: InspectionRule = {
          ...ruleData,
          id: `rule-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          rules: [...state.rules, newRule],
        }));
      },
      updateRule: (id, updates) => {
        set((state) => ({
          rules: state.rules.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
          ),
        }));
      },
      deleteRule: (id) => {
        set((state) => ({
          rules: state.rules.filter((r) => r.id !== id),
        }));
      },
      toggleRule: (id) => {
        set((state) => ({
          rules: state.rules.map((r) =>
            r.id === id ? { ...r, enabled: !r.enabled, updatedAt: new Date() } : r
          ),
        }));
      },
      getRuleById: (id) => get().rules.find((r) => r.id === id),
      getEnabledRules: () => get().rules.filter((r) => r.enabled),
      getRuleByType: (type) => get().rules.find((r) => r.type === type),
    }),
    {
      name: 'rule-storage',
    }
  )
);

export const RULE_TYPE_OPTIONS: { value: RuleType; label: string }[] = [
  { value: 'inventory_negative', label: '库存为负' },
  { value: 'price_drop', label: '价格突降' },
  { value: 'order_surge', label: '订单激增' },
  { value: 'coupon_stacking', label: '优惠叠加异常' },
  { value: 'unit_price_anomaly', label: '客单价异常' },
  { value: 'refund_rate_anomaly', label: '退款率异常' },
];

export const ALERT_LEVEL_OPTIONS: { value: AlertLevel; label: string; color: string }[] = [
  { value: 'critical', label: '严重', color: 'red' },
  { value: 'warning', label: '警告', color: 'orange' },
  { value: 'info', label: '提示', color: 'blue' },
];
