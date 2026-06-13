import { useState, useRef, useEffect } from 'react';
import { Bell, Search, X, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notificationRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead } = useAppStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索商品、订单、异常..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div ref={notificationRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                <h3 className="font-semibold text-slate-900">通知中心</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    全部已读
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无通知</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markNotificationAsRead(notification.id)}
                      className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 text-sm">{notification.title}</p>
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-slate-400 mt-2">
                            {format(new Date(notification.createdAt), 'MM-dd HH:mm', { locale: zhCN })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 10 && (
                <div className="p-3 text-center border-t border-slate-100">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    查看全部通知
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200"></div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">
              {format(new Date(), 'yyyy年MM月dd日', { locale: zhCN })}
            </p>
            <p className="text-xs text-slate-500">
              {format(new Date(), 'EEEE HH:mm', { locale: zhCN })}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
