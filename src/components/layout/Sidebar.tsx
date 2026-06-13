import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, AlertTriangle, FileText, History, BarChart3 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useAnomalyStore } from '../../store/anomalyStore';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '巡检首页' },
  { path: '/rules', icon: Settings, label: '规则配置' },
  { path: '/anomalies', icon: AlertTriangle, label: '异常列表' },
  { path: '/records', icon: History, label: '处理记录' },
  { path: '/reports', icon: BarChart3, label: '报告生成' },
];

export default function Sidebar() {
  const pendingCount = useAnomalyStore((state) => state.getPendingCount());

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white min-h-screen flex flex-col shadow-xl">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              数据巡检系统
            </h1>
            <p className="text-xs text-slate-400">电商运营数据保障</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25 text-white'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="font-medium">{item.label}</span>
            {item.path === '/anomalies' && pendingCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                {pendingCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
              {useAppStore.getState().currentUser?.name.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {useAppStore.getState().currentUser?.name || '用户'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {useAppStore.getState().currentUser?.role === 'admin' ? '管理员' : 
                 useAppStore.getState().currentUser?.role === 'operator' ? '运营专员' : '分析师'}
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-400 space-y-1">
            <p>今日巡检: 正常</p>
            <p>待处理异常: {pendingCount} 个</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
