import { Shop, InspectionRule, Anomaly, ProcessingRecord, Product, Order, User, Notification } from '../types';

export const shops: Shop[] = [
  { id: 'shop-001', name: '潮流服饰旗舰店', category: '服装', status: 'active' },
  { id: 'shop-002', name: '数码优品专营店', category: '数码', status: 'active' },
  { id: 'shop-003', name: '家居生活馆', category: '家居', status: 'active' },
  { id: 'shop-004', name: '美妆护肤专营', category: '美妆', status: 'active' },
  { id: 'shop-005', name: '母婴用品商城', category: '母婴', status: 'inactive' },
];

export const users: User[] = [
  { id: 'user-001', name: '张明', email: 'zhangming@example.com', role: 'admin' },
  { id: 'user-002', name: '李华', email: 'lihua@example.com', role: 'operator' },
  { id: 'user-003', name: '王芳', email: 'wangfang@example.com', role: 'operator' },
  { id: 'user-004', name: '赵伟', email: 'zhaowei@example.com', role: 'analyst' },
  { id: 'user-005', name: '陈静', email: 'chenjing@example.com', role: 'operator' },
];

export const inspectionRules: InspectionRule[] = [
  {
    id: 'rule-001',
    name: '库存为负预警',
    type: 'inventory_negative',
    threshold: 0,
    unit: '件',
    level: 'critical',
    enabled: true,
    priority: 1,
    description: '当商品库存小于0时触发告警',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'rule-002',
    name: '价格突降预警',
    type: 'price_drop',
    threshold: 30,
    unit: '%',
    level: 'warning',
    enabled: true,
    priority: 2,
    description: '商品价格24小时内降幅超过30%时触发告警',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'rule-003',
    name: '订单激增预警',
    type: 'order_surge',
    threshold: 100,
    unit: '单/小时',
    level: 'warning',
    enabled: true,
    priority: 3,
    description: '单个店铺1小时内订单量超过100单时触发告警',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'rule-004',
    name: '优惠叠加异常',
    type: 'coupon_stacking',
    threshold: 50,
    unit: '%',
    level: 'critical',
    enabled: true,
    priority: 1,
    description: '订单优惠叠加后减免金额超过原价50%时触发告警',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'rule-005',
    name: '客单价异常预警',
    type: 'unit_price_anomaly',
    threshold: 5000,
    unit: '元',
    level: 'info',
    enabled: true,
    priority: 4,
    description: '单个订单金额超过5000元时触发告警',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'rule-006',
    name: '退款率异常预警',
    type: 'refund_rate_anomaly',
    threshold: 20,
    unit: '%',
    level: 'warning',
    enabled: true,
    priority: 2,
    description: '单个商品7天内退款率超过20%时触发告警',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'rule-007',
    name: '超低价商品监控',
    type: 'price_drop',
    threshold: 10,
    unit: '元',
    level: 'info',
    enabled: false,
    priority: 5,
    description: '商品价格低于10元时触发告警',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'rule-008',
    name: '库存紧张预警',
    type: 'inventory_negative',
    threshold: 10,
    unit: '件',
    level: 'info',
    enabled: true,
    priority: 3,
    description: '商品库存少于10件时触发告警',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
];

export const products: Product[] = [
  { id: 'prod-001', name: '韩版休闲夹克', price: 299, originalPrice: 599, inventory: -5, image: 'https://picsum.photos/200/200?random=1', category: '外套', shopId: 'shop-001', status: 'active' },
  { id: 'prod-002', name: '纯棉T恤 男款', price: 89, originalPrice: 199, inventory: 234, image: 'https://picsum.photos/200/200?random=2', category: 'T恤', shopId: 'shop-001', status: 'active' },
  { id: 'prod-003', name: '运动休闲裤', price: 159, originalPrice: 299, inventory: 87, image: 'https://picsum.photos/200/200?random=3', category: '裤子', shopId: 'shop-001', status: 'active' },
  { id: 'prod-004', name: '无线蓝牙耳机', price: 199, originalPrice: 399, inventory: 156, image: 'https://picsum.photos/200/200?random=4', category: '数码配件', shopId: 'shop-002', status: 'active' },
  { id: 'prod-005', name: '智能手环', price: 149, originalPrice: 249, inventory: 0, image: 'https://picsum.photos/200/200?random=5', category: '智能穿戴', shopId: 'shop-002', status: 'sold_out' },
  { id: 'prod-006', name: '移动电源 20000mAh', price: 99, originalPrice: 199, inventory: 45, image: 'https://picsum.photos/200/200?random=6', category: '充电设备', shopId: 'shop-002', status: 'active' },
  { id: 'prod-007', name: '北欧风台灯', price: 189, originalPrice: 389, inventory: 23, image: 'https://picsum.photos/200/200?random=7', category: '灯具', shopId: 'shop-003', status: 'active' },
  { id: 'prod-008', name: '多功能收纳盒', price: 49, originalPrice: 99, inventory: 178, image: 'https://picsum.photos/200/200?random=8', category: '收纳', shopId: 'shop-003', status: 'active' },
  { id: 'prod-009', name: '保湿面霜 50g', price: 168, originalPrice: 298, inventory: 67, image: 'https://picsum.photos/200/200?random=9', category: '护肤', shopId: 'shop-004', status: 'active' },
  { id: 'prod-010', name: '氨基酸洗面奶', price: 89, originalPrice: 159, inventory: 123, image: 'https://picsum.photos/200/200?random=10', category: '洁面', shopId: 'shop-004', status: 'active' },
  { id: 'prod-011', name: '婴儿奶瓶消毒器', price: 259, originalPrice: 459, inventory: 34, image: 'https://picsum.photos/200/200?random=11', category: '喂养', shopId: 'shop-005', status: 'inactive' },
  { id: 'prod-012', name: '儿童益智积木', price: 79, originalPrice: 159, inventory: 89, image: 'https://picsum.photos/200/200?random=12', category: '玩具', shopId: 'shop-005', status: 'inactive' },
  { id: 'prod-013', name: '轻薄羽绒服', price: 399, originalPrice: 899, inventory: 12, image: 'https://picsum.photos/200/200?random=13', category: '外套', shopId: 'shop-001', status: 'active' },
  { id: 'prod-014', name: '机械键盘 RGB', price: 299, originalPrice: 599, inventory: 56, image: 'https://picsum.photos/200/200?random=14', category: '外设', shopId: 'shop-002', status: 'active' },
  { id: 'prod-015', name: '智能音箱', price: 199, originalPrice: 399, inventory: 0, image: 'https://picsum.photos/200/200?random=15', category: '音响', shopId: 'shop-002', status: 'sold_out' },
  { id: 'prod-016', name: '护眼台灯 LED', price: 129, originalPrice: 259, inventory: 78, image: 'https://picsum.photos/200/200?random=16', category: '灯具', shopId: 'shop-003', status: 'active' },
  { id: 'prod-017', name: '防晒霜 SPF50+', price: 99, originalPrice: 199, inventory: 234, image: 'https://picsum.photos/200/200?random=17', category: '防晒', shopId: 'shop-004', status: 'active' },
  { id: 'prod-018', name: '哺乳枕', price: 159, originalPrice: 299, inventory: 45, image: 'https://picsum.photos/200/200?random=18', category: '母婴', shopId: 'shop-005', status: 'inactive' },
  { id: 'prod-019', name: '加绒卫衣', price: 129, originalPrice: 259, inventory: 156, image: 'https://picsum.photos/200/200?random=19', category: '卫衣', shopId: 'shop-001', status: 'active' },
  { id: 'prod-020', name: '无线鼠标', price: 59, originalPrice: 129, inventory: 289, image: 'https://picsum.photos/200/200?random=20', category: '外设', shopId: 'shop-002', status: 'active' },
];

export const orders: Order[] = [
  { id: 'order-001', orderNo: 'DD202406010001', amount: 598, quantity: 2, status: 'paid', userId: 'user-101', userName: '张三', products: [{ productId: 'prod-001', productName: '韩版休闲夹克', quantity: 1, price: 299 }, { productId: 'prod-002', productName: '纯棉T恤 男款', quantity: 1, price: 89 }], coupons: ['满300减30'], createdAt: new Date('2024-06-01 10:23:45'), paidAt: new Date('2024-06-01 10:25:12') },
  { id: 'order-002', orderNo: 'DD202406010002', amount: 348, quantity: 1, status: 'shipped', userId: 'user-102', userName: '李四', products: [{ productId: 'prod-004', productName: '无线蓝牙耳机', quantity: 1, price: 199 }], coupons: [], createdAt: new Date('2024-06-01 11:15:30'), paidAt: new Date('2024-06-01 11:18:45') },
  { id: 'order-003', orderNo: 'DD202406010003', amount: 89, quantity: 1, status: 'paid', userId: 'user-103', userName: '王五', products: [{ productId: 'prod-020', productName: '无线鼠标', quantity: 1, price: 59 }], coupons: ['新人专享10元券'], createdAt: new Date('2024-06-01 12:30:00'), paidAt: new Date('2024-06-01 12:32:18') },
  { id: 'order-004', orderNo: 'DD202406010004', amount: 299, quantity: 1, status: 'delivered', userId: 'user-104', userName: '赵六', products: [{ productId: 'prod-007', productName: '北欧风台灯', quantity: 1, price: 189 }], coupons: [], createdAt: new Date('2024-06-01 13:45:22'), paidAt: new Date('2024-06-01 13:48:33') },
  { id: 'order-005', orderNo: 'DD202406010005', amount: 257, quantity: 2, status: 'paid', userId: 'user-105', userName: '孙七', products: [{ productId: 'prod-009', productName: '保湿面霜 50g', quantity: 1, price: 168 }, { productId: 'prod-010', productName: '氨基酸洗面奶', quantity: 1, price: 89 }], coupons: ['满200减20'], createdAt: new Date('2024-06-01 14:20:10'), paidAt: new Date('2024-06-01 14:22:45') },
  { id: 'order-006', orderNo: 'DD202406010006', amount: 5999, quantity: 1, status: 'pending', userId: 'user-106', userName: '周八', products: [{ productId: 'prod-013', productName: '轻薄羽绒服', quantity: 1, price: 399 }], coupons: [], createdAt: new Date('2024-06-01 15:10:30'), paidAt: null },
  { id: 'order-007', orderNo: 'DD202406010007', amount: 79, quantity: 1, status: 'refunded', userId: 'user-107', userName: '吴九', products: [{ productId: 'prod-012', productName: '儿童益智积木', quantity: 1, price: 79 }], coupons: [], createdAt: new Date('2024-06-01 16:05:00'), paidAt: new Date('2024-06-01 16:08:15') },
  { id: 'order-008', orderNo: 'DD202406010008', amount: 248, quantity: 2, status: 'paid', userId: 'user-108', userName: '郑十', products: [{ productId: 'prod-016', productName: '护眼台灯 LED', quantity: 1, price: 129 }, { productId: 'prod-008', productName: '多功能收纳盒', quantity: 1, price: 49 }], coupons: ['满100减10'], createdAt: new Date('2024-06-01 17:25:40'), paidAt: new Date('2024-06-01 17:28:02') },
  { id: 'order-009', orderNo: 'DD202406010009', amount: 198, quantity: 1, status: 'shipped', userId: 'user-109', userName: '钱十一', products: [{ productId: 'prod-017', productName: '防晒霜 SPF50+', quantity: 2, price: 99 }], coupons: [], createdAt: new Date('2024-06-01 18:12:30'), paidAt: new Date('2024-06-01 18:15:48') },
  { id: 'order-010', orderNo: 'DD202406010010', amount: 399, quantity: 1, status: 'paid', userId: 'user-110', userName: '孙十二', products: [{ productId: 'prod-014', productName: '机械键盘 RGB', quantity: 1, price: 299 }], coupons: ['满300减50'], createdAt: new Date('2024-06-01 19:08:20'), paidAt: new Date('2024-06-01 19:11:35') },
];

const now = new Date();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);

export const anomalies: Anomaly[] = [
  { id: 'ano-001', ruleId: 'rule-001', type: 'inventory_negative', level: 'critical', status: 'pending', title: '商品库存为负', description: '韩版休闲夹克当前库存为-5件', shopId: 'shop-001', productIds: ['prod-001'], orderIds: [], threshold: 0, actualValue: -5, deviation: 5, assignee: '', assigneeName: '', resolution: '', handledAt: null, createdAt: now, updatedAt: now },
  { id: 'ano-002', ruleId: 'rule-002', type: 'price_drop', level: 'warning', status: 'processing', title: '价格突降预警', description: '韩版休闲夹克24小时内价格从599元降至299元，降幅50.08%', shopId: 'shop-001', productIds: ['prod-001'], orderIds: ['order-001'], threshold: 30, actualValue: 50.08, deviation: 20.08, assignee: 'user-002', assigneeName: '李华', resolution: '', handledAt: null, createdAt: yesterday, updatedAt: yesterday },
  { id: 'ano-003', ruleId: 'rule-005', type: 'unit_price_anomaly', level: 'info', status: 'resolved', title: '客单价异常', description: '订单DD202406010006金额5999元，超过设定阈值5000元', shopId: 'shop-001', productIds: ['prod-013'], orderIds: ['order-006'], threshold: 5000, actualValue: 5999, deviation: 999, assignee: 'user-003', assigneeName: '王芳', resolution: '经核实为正常大额订单，已确认', handledAt: twoDaysAgo, createdAt: twoDaysAgo, updatedAt: twoDaysAgo },
  { id: 'ano-004', ruleId: 'rule-004', type: 'coupon_stacking', level: 'critical', status: 'pending', title: '优惠叠加异常', description: '订单享受多重优惠叠加，减免金额占原价的52%，超过阈值50%', shopId: 'shop-001', productIds: ['prod-002', 'prod-003'], orderIds: ['order-002'], threshold: 50, actualValue: 52, deviation: 2, assignee: '', assigneeName: '', resolution: '', handledAt: null, createdAt: threeDaysAgo, updatedAt: threeDaysAgo },
  { id: 'ano-005', ruleId: 'rule-006', type: 'refund_rate_anomaly', level: 'warning', status: 'resolved', title: '退款率异常', description: '无线蓝牙耳机近7天退款率25%，超过阈值20%', shopId: 'shop-002', productIds: ['prod-004'], orderIds: [], threshold: 20, actualValue: 25, deviation: 5, assignee: 'user-002', assigneeName: '李华', resolution: '已联系供应商核实质量问题，正在处理中', handledAt: fourDaysAgo, createdAt: fourDaysAgo, updatedAt: fourDaysAgo },
  { id: 'ano-006', ruleId: 'rule-001', type: 'inventory_negative', level: 'critical', status: 'ignored', title: '商品库存为负', description: '智能手环当前库存为0件，已售罄', shopId: 'shop-002', productIds: ['prod-005'], orderIds: [], threshold: 0, actualValue: 0, deviation: 0, assignee: 'user-003', assigneeName: '王芳', resolution: '商品已下架，无需处理', handledAt: fiveDaysAgo, createdAt: fiveDaysAgo, updatedAt: fiveDaysAgo },
  { id: 'ano-007', ruleId: 'rule-003', type: 'order_surge', level: 'warning', status: 'resolved', title: '订单激增预警', description: '潮流服饰旗舰店1小时内产生125个订单，超过阈值100', shopId: 'shop-001', productIds: [], orderIds: ['order-001', 'order-002', 'order-003', 'order-004', 'order-005'], threshold: 100, actualValue: 125, deviation: 25, assignee: 'user-002', assigneeName: '李华', resolution: '经核实为限时促销活动正常流量，无需特殊处理', handledAt: sixDaysAgo, createdAt: sixDaysAgo, updatedAt: sixDaysAgo },
  { id: 'ano-008', ruleId: 'rule-002', type: 'price_drop', level: 'warning', status: 'pending', title: '价格突降预警', description: '轻薄羽绒服价格从899元降至399元，降幅55.62%', shopId: 'shop-001', productIds: ['prod-013'], orderIds: [], threshold: 30, actualValue: 55.62, deviation: 25.62, assignee: '', assigneeName: '', resolution: '', handledAt: null, createdAt: now, updatedAt: now },
  { id: 'ano-009', ruleId: 'rule-004', type: 'coupon_stacking', level: 'critical', status: 'processing', title: '优惠叠加异常', description: '机械键盘订单优惠叠加减免金额占原价的54%', shopId: 'shop-002', productIds: ['prod-014'], orderIds: ['order-010'], threshold: 50, actualValue: 54, deviation: 4, assignee: 'user-005', assigneeName: '陈静', resolution: '', handledAt: null, createdAt: yesterday, updatedAt: yesterday },
  { id: 'ano-010', ruleId: 'rule-006', type: 'refund_rate_anomaly', level: 'warning', status: 'pending', title: '退款率异常', description: '婴儿奶瓶消毒器近7天退款率22%，超过阈值20%', shopId: 'shop-005', productIds: ['prod-011'], orderIds: [], threshold: 20, actualValue: 22, deviation: 2, assignee: '', assigneeName: '', resolution: '', handledAt: null, createdAt: twoDaysAgo, updatedAt: twoDaysAgo },
];

export const processingRecords: ProcessingRecord[] = [
  { id: 'proc-001', anomalyId: 'ano-002', operator: 'user-002', operatorName: '李华', action: 'assigned', previousValue: '', newValue: '李华', comment: '接手处理价格突降异常', createdAt: yesterday },
  { id: 'proc-002', anomalyId: 'ano-003', operator: 'user-003', operatorName: '王芳', action: 'assigned', previousValue: '', newValue: '王芳', comment: '分配给王芳核实', createdAt: twoDaysAgo },
  { id: 'proc-003', anomalyId: 'ano-003', operator: 'user-003', operatorName: '王芳', action: 'resolved', previousValue: 'processing', newValue: 'resolved', comment: '经核实为正常大额订单，已确认', createdAt: twoDaysAgo },
  { id: 'proc-004', anomalyId: 'ano-005', operator: 'user-002', operatorName: '李华', action: 'assigned', previousValue: '', newValue: '李华', comment: '接手处理退款率异常', createdAt: fourDaysAgo },
  { id: 'proc-005', anomalyId: 'ano-005', operator: 'user-002', operatorName: '李华', action: 'resolved', previousValue: 'processing', newValue: 'resolved', comment: '已联系供应商核实质量问题，正在处理中', createdAt: fourDaysAgo },
  { id: 'proc-006', anomalyId: 'ano-006', operator: 'user-003', operatorName: '王芳', action: 'assigned', previousValue: '', newValue: '王芳', comment: '分配给王芳处理', createdAt: fiveDaysAgo },
  { id: 'proc-007', anomalyId: 'ano-006', operator: 'user-003', operatorName: '王芳', action: 'level_changed', previousValue: 'critical', newValue: 'info', comment: '商品已下架，调整级别', createdAt: fiveDaysAgo },
  { id: 'proc-008', anomalyId: 'ano-006', operator: 'user-003', operatorName: '王芳', action: 'ignored', previousValue: 'processing', newValue: 'ignored', comment: '商品已下架，无需处理', createdAt: fiveDaysAgo },
  { id: 'proc-009', anomalyId: 'ano-007', operator: 'user-002', operatorName: '李华', action: 'assigned', previousValue: '', newValue: '李华', comment: '接手处理订单激增异常', createdAt: sixDaysAgo },
  { id: 'proc-010', anomalyId: 'ano-007', operator: 'user-002', operatorName: '李华', action: 'resolved', previousValue: 'processing', newValue: 'resolved', comment: '经核实为限时促销活动正常流量，无需特殊处理', createdAt: sixDaysAgo },
  { id: 'proc-011', anomalyId: 'ano-009', operator: 'user-005', operatorName: '陈静', action: 'assigned', previousValue: '', newValue: '陈静', comment: '接手处理优惠叠加异常', createdAt: yesterday },
  { id: 'proc-012', anomalyId: 'ano-004', operator: 'user-002', operatorName: '李华', action: 'comment', previousValue: '', newValue: '', comment: '需要进一步核实订单优惠详情', createdAt: threeDaysAgo },
];

export const notifications: Notification[] = [
  { id: 'notif-001', title: '新异常告警', message: '商品库存为负：韩版休闲夹克当前库存为-5件', type: 'error', read: false, anomalyId: 'ano-001', createdAt: now },
  { id: 'notif-002', title: '价格突降提醒', message: '轻薄羽绒服24小时内价格降幅55.62%，需要关注', type: 'warning', read: false, anomalyId: 'ano-008', createdAt: now },
  { id: 'notif-003', title: '异常处理提醒', message: '您有1个异常正在处理中，请及时处理', type: 'info', read: true, anomalyId: 'ano-002', createdAt: yesterday },
  { id: 'notif-004', title: '巡检完成', message: '今日巡检已完成，发现3个异常', type: 'success', read: true, createdAt: yesterday },
];

export const trendData = [
  { date: '06-08', anomalies: 3, resolved: 2 },
  { date: '06-09', anomalies: 5, resolved: 4 },
  { date: '06-10', anomalies: 4, resolved: 3 },
  { date: '06-11', anomalies: 7, resolved: 5 },
  { date: '06-12', anomalies: 6, resolved: 6 },
  { date: '06-13', anomalies: 8, resolved: 7 },
  { date: '06-14', anomalies: 4, resolved: 2 },
];

export const anomalyTypeDistribution = [
  { type: '库存为负', value: 25, color: '#ef4444' },
  { type: '价格突降', value: 30, color: '#f59e0b' },
  { type: '订单激增', value: 15, color: '#3b82f6' },
  { type: '优惠叠加', value: 20, color: '#8b5cf6' },
  { type: '其他', value: 10, color: '#6b7280' },
];
