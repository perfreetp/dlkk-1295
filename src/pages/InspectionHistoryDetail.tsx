import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Target,
  List,
  TrendingUp
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useAnomalyStore } from '../store/anomalyStore';
import { useRuleStore } from '../store/ruleStore';
import Badge from '../components/common/Badge';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function InspectionHistoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInspectionById, shops } = useAppStore();
  const { anomalies } = useAnomalyStore();
  const { rules, getRuleById } = useRuleStore();

  const inspection = getInspectionById(id || '');

  if (!inspection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Clock className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">巡检记录不存在</h2>
        <p className="text-slate-500 mb-6">该巡检记录可能被删除或不存在</p>
        <Link
          to="/records"
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          返回处理记录
        </Link>
      </div>
    );
  }

  const relatedAnomalies = inspection.anomalyIds
    .map((anoId) => anomalies.find((a) => a.id === anoId))
    .filter(Boolean);
  
  const hitRules = inspection.hitRuleIds
    .map((ruleId) => getRuleById(ruleId))
    .filter(Boolean);
  
  const shop = inspection.shopId ? shops.find((s) => s.id === inspection.shopId) : null;
  const duration = inspection.endTime
    ? Math.round((new Date(inspection.endTime).getTime() - new Date(inspection.startTime).getTime()) / 1000)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            巡检详情
          </h1>
          <p className="text-slate-500 mt-1">ID: {inspection.id}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl ${
              inspection.status === 'running' ? 'bg-blue-100 text-blue-600' :
              inspection.anomaliesFound > 0 ? 'bg-orange-100 text-orange-600' :
              'bg-green-100 text-green-600'
            }`}>
              {inspection.status === 'running' ? (
                <TrendingUp className="w-8 h-8 animate-pulse" />
              ) : inspection.anomaliesFound > 0 ? (
                <AlertTriangle className="w-8 h-8" />
              ) : (
                <CheckCircle className="w-8 h-8" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-slate-900">
                  {format(new Date(inspection.startTime), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })} 巡检报告
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  inspection.status === 'running' ? 'bg-blue-100 text-blue-700' :
                  inspection.status === 'completed' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {inspection.status === 'running' ? '进行中' : inspection.status === 'completed' ? '已完成' : '失败'}
                </span>
              </div>
              <p className="text-slate-600">{inspection.summary}</p>
            </div>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>操作人: {inspection.operatorName}</p>
            {duration && <p>耗时: {duration}秒</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{inspection.totalRules}</p>
            <p className="text-sm text-slate-500 mt-1">执行规则</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{inspection.criticalCount}</p>
            <p className="text-sm text-red-500 mt-1">严重异常</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{inspection.warningCount}</p>
            <p className="text-sm text-orange-500 mt-1">警告异常</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{inspection.infoCount}</p>
            <p className="text-sm text-blue-500 mt-1">提示异常</p>
          </div>
          <div className={`rounded-xl p-4 text-center ${
            inspection.anomaliesFound > 0 ? 'bg-orange-50' : 'bg-green-50'
          }`}>
            <p className={`text-2xl font-bold ${
              inspection.anomaliesFound > 0 ? 'text-orange-600' : 'text-green-600'
            }`}>
              {inspection.anomaliesFound}
            </p>
            <p className={`text-sm mt-1 ${
              inspection.anomaliesFound > 0 ? 'text-orange-500' : 'text-green-500'
            }`}>
              异常总数
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="w-4 h-4" />
            <span>开始时间: {format(new Date(inspection.startTime), 'HH:mm:ss', { locale: zhCN })}</span>
          </div>
          {inspection.endTime && (
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4" />
              <span>结束时间: {format(new Date(inspection.endTime), 'HH:mm:ss', { locale: zhCN })}</span>
            </div>
          )}
          {shop && (
            <div className="flex items-center gap-2 text-slate-600">
              <Target className="w-4 h-4" />
              <span>巡检店铺: {shop.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-600">
            <List className="w-4 h-4" />
            <span>关联异常: {inspection.anomalyIds.length}个</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center gap-3">
            <Target className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-slate-900">命中规则</h3>
            <span className="ml-auto text-sm text-slate-500">{hitRules.length}条</span>
          </div>
          <div className="divide-y divide-slate-100">
            {hitRules.length > 0 ? (
              hitRules.map((rule) => rule && (
                <div key={rule.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      rule.level === 'critical' ? 'bg-red-100 text-red-600' :
                      rule.level === 'warning' ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{rule.name}</p>
                      <p className="text-sm text-slate-500">{rule.description}</p>
                    </div>
                  </div>
                  <Badge variant="level" value={rule.level} />
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">
                <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>未命中任何规则</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-slate-900">关联异常</h3>
            <span className="ml-auto text-sm text-slate-500">{relatedAnomalies.length}条</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {relatedAnomalies.length > 0 ? (
              relatedAnomalies.map((anomaly) => anomaly && (
                <Link
                  key={anomaly.id}
                  to={`/anomalies/${anomaly.id}`}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      anomaly.level === 'critical' ? 'bg-red-100 text-red-600' :
                      anomaly.level === 'warning' ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{anomaly.title}</p>
                      <p className="text-sm text-slate-500 truncate max-w-xs">{anomaly.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="level" value={anomaly.level} />
                    <Badge variant="status" value={anomaly.status} />
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>本次巡检未发现异常</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">异常级别分布</h3>
        <div className="flex items-end gap-4 h-32">
          <div className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg transition-all"
              style={{ height: `${Math.max(20, (inspection.criticalCount / Math.max(inspection.anomaliesFound, 1)) * 100)}%` }}
            ></div>
            <p className="text-sm font-medium text-slate-700 mt-2">{inspection.criticalCount}</p>
            <p className="text-xs text-slate-500">严重</p>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg transition-all"
              style={{ height: `${Math.max(20, (inspection.warningCount / Math.max(inspection.anomaliesFound, 1)) * 100)}%` }}
            ></div>
            <p className="text-sm font-medium text-slate-700 mt-2">{inspection.warningCount}</p>
            <p className="text-xs text-slate-500">警告</p>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all"
              style={{ height: `${Math.max(20, (inspection.infoCount / Math.max(inspection.anomaliesFound, 1)) * 100)}%` }}
            ></div>
            <p className="text-sm font-medium text-slate-700 mt-2">{inspection.infoCount}</p>
            <p className="text-xs text-slate-500">提示</p>
          </div>
        </div>
      </div>
    </div>
  );
}
