import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Notification, Shop, InspectionHistory, ReportSubscription } from '../types';
import { shops as initialShops, users as initialUsers, notifications as initialNotifications } from '../data/mockData';

const defaultSubscription: ReportSubscription = {
  daily: { enabled: false, methods: ['站内信'], userIds: [], lastSentAt: null },
  weekly: { enabled: false, methods: ['站内信'], userIds: [], lastSentAt: null },
  monthly: { enabled: false, methods: ['站内信'], userIds: [], lastSentAt: null },
};

interface AppState {
  currentUser: User | null;
  users: User[];
  shops: Shop[];
  notifications: Notification[];
  unreadCount: number;
  selectedShopId: string;
  selectedDateRange: { start: Date; end: Date };
  inspectionHistory: InspectionHistory[];
  subscription: ReportSubscription;
  setCurrentUser: (user: User | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  setSelectedShopId: (shopId: string) => void;
  setSelectedDateRange: (range: { start: Date; end: Date }) => void;
  startInspection: (totalRules: number, anomalyIds?: string[], hitRuleIds?: string[], shopId?: string) => string;
  completeInspection: (id: string, anomaliesFound: number, criticalCount: number, warningCount: number, infoCount: number) => void;
  getLatestInspection: () => InspectionHistory | null;
  getInspectionById: (id: string) => InspectionHistory | undefined;
  updateSubscription: (subscription: Partial<ReportSubscription>) => void;
  getSubscription: () => ReportSubscription;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: initialUsers[0],
      users: initialUsers,
      shops: initialShops,
      notifications: initialNotifications,
      unreadCount: initialNotifications.filter(n => !n.read).length,
      selectedShopId: '',
      selectedDateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
      inspectionHistory: [],
      subscription: defaultSubscription,
      setCurrentUser: (user) => set({ currentUser: user }),
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}`,
          createdAt: new Date(),
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },
      markNotificationAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          if (notification && !notification.read) {
            return {
              notifications: state.notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
              ),
              unreadCount: Math.max(0, state.unreadCount - 1),
            };
          }
          return state;
        });
      },
      markAllNotificationsAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },
      setSelectedShopId: (shopId) => set({ selectedShopId: shopId }),
      setSelectedDateRange: (range) => set({ selectedDateRange: range }),
      startInspection: (totalRules, anomalyIds = [], hitRuleIds = [], shopId) => {
        const user = get().currentUser;
        const newInspection: InspectionHistory = {
          id: `insp-${Date.now()}`,
          startTime: new Date(),
          endTime: null,
          status: 'running',
          totalRules,
          anomaliesFound: 0,
          criticalCount: 0,
          warningCount: 0,
          infoCount: 0,
          summary: '',
          operatorId: user?.id || 'system',
          operatorName: user?.name || '系统',
          anomalyIds,
          hitRuleIds,
          shopId,
        };
        set((state) => ({
          inspectionHistory: [newInspection, ...state.inspectionHistory],
        }));
        return newInspection.id;
      },
      completeInspection: (id, anomaliesFound, criticalCount, warningCount, infoCount) => {
        let summary = '';
        if (anomaliesFound === 0) {
          summary = '本次巡检未发现异常，所有数据正常';
        } else {
          const parts = [];
          if (criticalCount > 0) parts.push(`${criticalCount}个严重`);
          if (warningCount > 0) parts.push(`${warningCount}个警告`);
          if (infoCount > 0) parts.push(`${infoCount}个提示`);
          summary = `发现${anomaliesFound}个异常，其中${parts.join('、')}`;
        }
        
        set((state) => ({
          inspectionHistory: state.inspectionHistory.map((h) =>
            h.id === id
              ? {
                  ...h,
                  endTime: new Date(),
                  status: 'completed' as const,
                  anomaliesFound,
                  criticalCount,
                  warningCount,
                  infoCount,
                  summary,
                }
              : h
          ),
        }));
      },
      getLatestInspection: () => {
        const history = get().inspectionHistory;
        return history.length > 0 ? history[0] : null;
      },
      getInspectionById: (id) => {
        return get().inspectionHistory.find((h) => h.id === id);
      },
      updateSubscription: (subscription) => {
        set((state) => ({
          subscription: { ...state.subscription, ...subscription },
        }));
      },
      getSubscription: () => get().subscription,
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        selectedShopId: state.selectedShopId,
        selectedDateRange: state.selectedDateRange,
        inspectionHistory: state.inspectionHistory,
        subscription: state.subscription,
      }),
    }
  )
);
