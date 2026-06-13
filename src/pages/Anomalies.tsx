import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronDown,
  AlertTriangle,
  ArrowRight,
  X,
  Calendar
} from 'lucide-react';
import { useAnomalyStore } from '../store/anomalyStore';
import { useAppStore } from '../store/appStore';
import { RULE_TYPE_OPTIONS, ALERT_LEVEL_OPTIONS } from '../store/ruleStore';
import { RuleType, AlertLevel, AnomalyStatus } from '../types';
import Badge from '../components/common/Badge';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Anomalies() {
  const { getFilteredAnomalies, filters, setFilters, resetFilters } = useAnomalyStore();
  const { shops } = useAppStore();
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const pageSize = 10;

  const filteredAnomalies = getFilteredAnomalies();
  const totalPages = Math.ceil(filteredAnomalies.length / pageSize);
  const paginatedAnomalies = filteredAnomalies.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const applyDateFilter = () => {
    if (startDate && endDate) {
      setFilters({
        dateRange: {
          start: startOfDay(new Date(startDate)),
          end: endOfDay(new Date(endDate)),
        },
      });
    }
  };

  const handleResetFilters = () => {
    resetFilters();
    setStartDate(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    setEndDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const handleExport = () => {
    const data = filteredAnomalies.map((a) => ({
      ID: a.id,
      标题: a.title,
      类型: RULE_TYPE_OPTIONS.find((t) => t.value === a.type)?.label,
      级别: a.level,
      状态: a.status,
      店铺: shops.find((s) => s.id === a.shopId)?.name,
      创建时间: format(new Date(a.createdAt), 'yyyy-MM-dd HH:mm'),
    }));
    
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map((row) => Object.values(row).join(',')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `异常列表_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
  };

  const hasActiveFilters = filters.shopId || filters.type || filters.level || filters.status || filters.searchKeyword || filters.dateRange;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            异常列表
          </h1>
          <p className="text-slate-500 mt-1">查看和管理所有数据异常记录</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-2.5 border rounded-lg font-medium transition-all ${
              showFilters || hasActiveFilters
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            筛选
            {hasActiveFilters && (
              <span className="ml-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                !
              </span>
            )}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-all"
          >
            <Download className="w-5 h-5" />
            导出
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">店铺</label>
              <select
                value={filters.shopId}
                onChange={(e) => setFilters({ shopId: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部店铺</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>{shop.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">异常类型</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ type: e.target.value as RuleType | '' })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部类型</option>
                {RULE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">告警级别</label>
              <select
                value={filters.level}
                onChange={(e) => setFilters({ level: e.target.value as AlertLevel | '' })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部级别</option>
                {ALERT_LEVEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">处理状态</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ status: e.target.value as AnomalyStatus | '' })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部状态</option>
                <option value="pending">待处理</option>
                <option value="processing">处理中</option>
                <option value="resolved">已解决</option>
                <option value="ignored">已忽略</option>
              </select>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600">时间范围:</span>
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <span className="text-slate-400">至</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={applyDateFilter}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                应用
              </button>
              {filters.dateRange && (
                <button
                  onClick={() => setFilters({ dateRange: null })}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium"
                >
                  清除日期
                </button>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
              >
                <X className="w-4 h-4" />
                清除筛选
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  异常信息
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  级别
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  店铺
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAnomalies.map((anomaly) => (
                <tr key={anomaly.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      to={`/anomalies/${anomaly.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        anomaly.level === 'critical' ? 'bg-red-100 text-red-600' :
                        anomaly.level === 'warning' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {anomaly.title}
                        </p>
                        <p className="text-sm text-slate-500 truncate mt-0.5">
                          {anomaly.description}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-700">
                      {RULE_TYPE_OPTIONS.find((t) => t.value === anomaly.type)?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="level" value={anomaly.level} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="status" value={anomaly.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-700">
                      {shops.find((s) => s.id === anomaly.shopId)?.name || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-500">
                      {format(new Date(anomaly.createdAt), 'MM-dd HH:mm', { locale: zhCN })}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link
                      to={`/anomalies/${anomaly.id}`}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      查看详情
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {paginatedAnomalies.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>暂无异常记录</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              显示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredAnomalies.length)} 条，共 {filteredAnomalies.length} 条
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
