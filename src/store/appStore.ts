import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Notification, Shop } from '../types';
import { shops as initialShops, users as initialUsers, notifications as initialNotifications } from '../data/mockData';

interface AppState {
  currentUser: User | null;
  users: User[];
  shops: Shop[];
  notifications: Notification[];
  unreadCount: number;
  selectedShopId: string;
  selectedDateRange: { start: Date; end: Date };
  setCurrentUser: (user: User | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  setSelectedShopId: (shopId: string) => void;
  setSelectedDateRange: (range: { start: Date; end: Date }) => void;
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
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        selectedShopId: state.selectedShopId,
        selectedDateRange: state.selectedDateRange,
      }),
    }
  )
);
