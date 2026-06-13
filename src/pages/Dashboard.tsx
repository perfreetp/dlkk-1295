import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Play, 
  Settings, 
  ArrowRight,
  Activity,
  Package,
  ShoppingCart
} from 'lucide-react';
import { useAnomalyStore } from '../store/anomalyStore';
import { useRuleStore } from '../store/ruleStore';
import { useAppStore } from '../store/appStore';
import { trendData, anomalyTypeDistribution } from '../data/mockData';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import TrendChart from '../components/charts/TrendChart';
import PieChart from '../components/charts/PieChart';
import Badge from '../components/common/Badge';

export default function Dashboard() {
  const [isInspecting, setIsInspecting] = useState(false);
  const { getPendingCount, getProcessingCount, getResolvedCount, anomalies, getTodayAnomalies } = useAnomalyStore();
  const { rules } = useRuleStore();
  const { shops, inspectionHistory, startInspection, completeInspection } = useAppStore();

  const pendingCount = getPendingCount();
  const processingCount = getProcessingCount();
  const resolvedCount = getResolvedCount();
  const todayAnomalies = getTodayAnomalies();
  const enabledRules = rules.filter(r => r.enabled).length;
  const totalAnomalies = anomalies.length;
  const resolutionRate = totalAnomalies > 0 ? Math.round((resolvedCount / totalAnomalies) * 100) : 0;

  const handleStartInspection = () => {
    setIsInspecting(true);
    const inspectionId = startInspection(enabledRules);
    
    setTimeout(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayAnomalyList = anomalies.filter((a) => new Date(a.createdAt) >= today);
      const criticalCount = todayAnomalyList.filter((a) => a.level === 'critical').length;
      const warningCount = todayAnomalyList.filter((a) => a.level === 'warning').length;
      const infoCount = todayAnomalyList.filter((a) => a.level === 'info').length;
      
      completeInspection(inspectionId, todayAnomalyList.length, criticalCount, warningCount, infoCount);
      setIsInspecting(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            数据巡检控制台
          </h1>
          <p className="text-slate-500 mt-1">实时监控电商运营数据异常，保障业务健康运行</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleStartInspection}
            disabled={isInspecting}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
              isInspecting
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5'
            }`}
          >
            {isInspecting ? (
              <>
                <Activity className="w-5 h-5 animate-pulse" />
                巡检中...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                启动巡检
              </>
            )}
          </button>
          <Link
            to="/rules"
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50 hover:shadow-md transition-all"
          >
            <Settings className="w-5 h-5" />
            配置规则
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-xl shadow-red-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
              待处理
            </span>
          </div>
          <p className="text-4xl font-bold mb-1">{pendingCount}</p>
          <p className="text-red-100 text-sm">当前待处理异常</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
              处理中
            </span>
          </div>
          <p className="text-4xl font-bold mb-1">{processingCount}</p>
          <p className="text-blue-100 text-sm">正在处理中</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl shadow-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
              已解决
            </span>
          </div>
          <p className="text-4xl font-bold mb-1">{resolvedCount}</p>
          <p className="text-green-100 text-sm">已处理完成</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
              解决率
            </span>
          </div>
          <p className="text-4xl font-bold mb-1">{resolutionRate}%</p>
          <p className="text-purple-100 text-sm">异常解决率</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">异常趋势</h2>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                异常数量
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                已解决
              </span>
            </div>
          </div>
          <TrendChart data={trendData} height={280} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">异常类型分布</h2>
          <PieChart data={anomalyTypeDistribution} height={280} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">待处理异常 (TOP 5)</h2>
            <Link
              to="/anomalies"
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              查看全部
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {anomalies
              .filter((a) => a.status === 'pending' || a.status === 'processing')
              .slice(0, 5)
              .map((anomaly) => (
                <Link
                  key={anomaly.id}
                  to={`/anomalies/${anomaly.id}`}
                  className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                >
                  <div className={`p-2 rounded-lg ${
                    anomaly.level === 'critical' ? 'bg-red-100 text-red-600' :
                    anomaly.level === 'warning' ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{anomaly.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {shops.find(s => s.id === anomaly.shopId)?.name || '未知店铺'}
                    </p>
                  </div>
                  <Badge variant="level" value={anomaly.level} />
                  <Badge variant="status" value={anomaly.status} />
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </Link>
              ))}
            {anomalies.filter((a) => a.status === 'pending' || a.status === 'processing').length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无待处理异常</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">今日概览</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm text-slate-600">今日异常</span>
                </div>
                <span className="font-semibold text-slate-900">{todayAnomalies.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm text-slate-600">活跃规则</span>
                </div>
                <span className="font-semibold text-slate-900">{enabledRules}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm text-slate-600">监控店铺</span>
                </div>
                <span className="font-semibold text-slate-900">{shops.filter(s => s.status === 'active').length}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
            <h3 className="font-semibold mb-4">最近巡检记录</h3>
            <div className="space-y-2">
              {inspectionHistory.slice(0, 5).map((record) => (
                <Link
                  key={record.id}
                  to={`/inspections/${record.id}`}
                  className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      record.status === 'running' ? 'bg-blue-400 animate-pulse' : 
                      record.anomaliesFound > 0 ? 'bg-orange-400' : 'bg-green-400'
                    }`}></div>
                    <span className="text-slate-300">
                      {format(new Date(record.startTime), 'MM-dd HH:mm')}
                    </span>
                    <span className="text-slate-500 text-xs group-hover:text-slate-300">
                      {record.operatorName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.status === 'running' ? (
                      <span className="text-blue-400 flex items-center gap-1">
                        进行中
                      </span>
                    ) : (
                      <span className={record.anomaliesFound > 0 ? 'text-orange-400' : 'text-green-400'}>
                        {record.anomaliesFound}个异常
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </Link>
              ))}
              {inspectionHistory.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">暂无巡检记录</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-400">
                {inspectionHistory.length > 0 
                  ? `上次巡检: ${format(new Date(inspectionHistory[0].startTime), 'MM-dd HH:mm', { locale: zhCN })}`
                  : `当前时间: ${format(new Date(), 'MM-dd HH:mm', { locale: zhCN })}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
