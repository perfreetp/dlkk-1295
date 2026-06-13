export type RuleType = 
  | 'inventory_negative'     
  | 'price_drop'             
  | 'order_surge'            
  | 'coupon_stacking'        
  | 'unit_price_anomaly'     
  | 'refund_rate_anomaly';   

export type AlertLevel = 'critical' | 'warning' | 'info';

export type AnomalyStatus = 'pending' | 'processing' | 'resolved' | 'ignored';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded';

export interface Shop {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'inactive';
}

export interface InspectionRule {
  id: string;
  name: string;
  type: RuleType;
  threshold: number;
  unit: string;
  level: AlertLevel;
  enabled: boolean;
  priority: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Anomaly {
  id: string;
  ruleId: string;
  type: RuleType;
  level: AlertLevel;
  status: AnomalyStatus;
  title: string;
  description: string;
  shopId: string;
  productIds: string[];
  orderIds: string[];
  threshold: number;
  actualValue: number;
  deviation: number;
  assignee: string;
  assigneeName: string;
  resolution: string;
  handledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessingRecord {
  id: string;
  anomalyId: string;
  operator: string;
  operatorName: string;
  action: 'assigned' | 'level_changed' | 'resolved' | 'comment' | 'ignored';
  previousValue: string;
  newValue: string;
  comment: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  inventory: number;
  image: string;
  category: string;
  shopId: string;
  status: 'active' | 'inactive' | 'sold_out';
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNo: string;
  amount: number;
  quantity: number;
  status: OrderStatus;
  userId: string;
  userName: string;
  products: OrderItem[];
  coupons: string[];
  createdAt: Date;
  paidAt: Date | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'analyst';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  anomalyId?: string;
  createdAt: Date;
}

export interface DailyReport {
  id: string;
  date: Date;
  totalChecks: number;
  totalAnomalies: number;
  resolvedAnomalies: number;
  pendingAnomalies: number;
  content: string;
  createdAt: Date;
}

export interface AnomalySnapshot {
  id: string;
  ruleId: string;
  type: RuleType;
  level: AlertLevel;
  status: AnomalyStatus;
  title: string;
  description: string;
  shopId: string;
  threshold: number;
  actualValue: number;
  deviation: number;
  assignee: string;
  assigneeName: string;
  resolution: string;
  createdAt: Date;
}

export interface InspectionHistory {
  id: string;
  startTime: Date;
  endTime: Date | null;
  status: 'running' | 'completed' | 'failed';
  totalRules: number;
  anomaliesFound: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  summary: string;
  operatorId: string;
  operatorName: string;
  anomalySnapshots: AnomalySnapshot[];
  hitRuleIds: string[];
  shopId?: string;
  shopName?: string;
}

export interface ArchivedReport {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  date: Date;
  shopId: string;
  shopName: string;
  content: string;
  statistics: {
    totalAnomalies: number;
    pending: number;
    processing: number;
    resolved: number;
    ignored: number;
  };
  createdAt: Date;
  createdBy: string;
  createdByName: string;
}

export interface ReportSubscription {
  daily: {
    enabled: boolean;
    methods: string[];
    userIds: string[];
    lastSentAt: Date | null;
  };
  weekly: {
    enabled: boolean;
    methods: string[];
    userIds: string[];
    lastSentAt: Date | null;
  };
  monthly: {
    enabled: boolean;
    methods: string[];
    userIds: string[];
    lastSentAt: Date | null;
  };
}

export const RULE_TYPE_LABELS: Record<RuleType, string> = {
  inventory_negative: '库存为负',
  price_drop: '价格突降',
  order_surge: '订单激增',
  coupon_stacking: '优惠叠加异常',
  unit_price_anomaly: '客单价异常',
  refund_rate_anomaly: '退款率异常',
};

export const ALERT_LEVEL_LABELS: Record<AlertLevel, string> = {
  critical: '严重',
  warning: '警告',
  info: '提示',
};

export const ANOMALY_STATUS_LABELS: Record<AnomalyStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
  ignored: '已忽略',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '待支付',
  paid: '已支付',
  shipped: '已发货',
  delivered: '已收货',
  refunded: '已退款',
};
