import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  History,
  CheckCircle,
  User,
  Clock,
  BarChart3,
  TrendingUp,
  Award
} from 'lucide-react';
import { useAnomalyStore } from '../store/anomalyStore';
import { useAppStore } from '../store/appStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Records() {
  const { processingRecords, anomalies } = useAnomalyStore();
  const { users } = useAppStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');

  const filteredRecords = processingRecords.filter((record) => {
    if (selectedOperator && record.operator !== selectedOperator) return false;
    if (searchKeyword) {
      const anomaly = anomalies.find((a) => a.id === record.anomalyId);
      const keyword = searchKeyword.toLowerCase();
      if (
        !anomaly?.title.toLowerCase().includes(keyword) &&
        !record.comment.toLowerCase().includes(keyword) &&
        !record.operatorName.toLowerCase().includes(keyword)
      ) {
        return false;
      }
    }
    return true;
  });

  const operatorStats = users
    .filter((u) => u.role === 'operator' || u.role === 'admin')
    .map((user) => {
      const userRecords = processingRecords.filter((r) => r.operator === user.id);
      const resolvedCount = userRecords.filter((r) => r.action === 'resolved').length;
      const assignedCount = userRecords.filter((r) => r.action === 'assigned').length;
      return {
        user,
        totalRecords: userRecords.length,
        resolvedCount,
        assignedCount,
      };
    })
    .sort((a, b) => b.resolvedCount - a.resolvedCount);

  const totalResolved = processingRecords.filter((r) => r.action === 'resolved').length;
  const totalAssigned = processingRecords.filter((r) => r.action === 'assigned').length;
  const avgResolutionTime = 4.5;

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'resolved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">已解决</span>;
      case 'assigned':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">已指派</span>;
      case 'level_changed':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">级别变更</span>;
      case 'comment':
        return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">备注</span>;
      case 'ignored':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">已忽略</span>;
      default:
        return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">{action}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          处理记录
        </h1>
        <p className="text-slate-500 mt-1">查看和处理历史记录统计</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold">{totalResolved}</p>
          <p className="text-green-100 text-sm mt-1">已解决异常</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <User className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold">{totalAssigned}</p>
          <p className="text-blue-100 text-sm mt-1">已指派任务</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold">{avgResolutionTime}h</p>
          <p className="text-purple-100 text-sm mt-1">平均处理时长</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold">{processingRecords.length}</p>
          <p className="text-orange-100 text-sm mt-1">总处理记录</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900">处理历史</h2>
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="搜索处理记录..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={selectedOperator}
                  onChange={(e) => setSelectedOperator(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部人员</option>
                  {users.filter((u) => u.role === 'operator' || u.role === 'admin').map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredRecords.map((record) => {
              const anomaly = anomalies.find((a) => a.id === record.anomalyId);
              return (
                <div key={record.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {record.operatorName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{record.operatorName}</p>
                        {anomaly && (
                          <Link
                            to={`/anomalies/${anomaly.id}`}
                            className="text-sm text-blue-600 hover:text-blue-700 mt-1 block"
                          >
                            {anomaly.title}
                          </Link>
                        )}
                        {record.comment && (
                          <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-lg p-3">
                            {record.comment}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-2">
                          {format(new Date(record.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                        </p>
                      </div>
                    </div>
                    {getActionBadge(record.action)}
                  </div>
                </div>
              );
            })}
            {filteredRecords.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无处理记录</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-yellow-500" />
              <h2 className="text-lg font-semibold text-slate-900">处理人工作量排行</h2>
            </div>
            <div className="space-y-4">
              {operatorStats.slice(0, 5).map((stat, index) => (
                <div key={stat.user.id} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-slate-400' :
                    index === 2 ? 'bg-amber-600' :
                    'bg-slate-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{stat.user.name}</p>
                    <p className="text-xs text-slate-500">已解决 {stat.resolvedCount} 个异常</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{stat.resolvedCount}</p>
                    <p className="text-xs text-slate-500">解决数</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h3 className="font-semibold">处理效率统计</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 text-sm">本周解决</span>
                <span className="font-semibold">{totalResolved - 5}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300 text-sm">上周解决</span>
                <span className="font-semibold">{totalResolved - 8}</span>
              </div>
              <div className="pt-4 border-t border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-green-400 text-sm">环比增长</span>
                  <span className="font-semibold text-green-400">+15%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">历史巡检记录</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">06-14 巡检</span>
                </div>
                <span className="text-sm text-slate-500">08:00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">06-13 巡检</span>
                </div>
                <span className="text-sm text-slate-500">08:00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">06-12 巡检</span>
                </div>
                <span className="text-sm text-slate-500">08:00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">06-11 巡检</span>
                </div>
                <span className="text-sm text-slate-500">08:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
