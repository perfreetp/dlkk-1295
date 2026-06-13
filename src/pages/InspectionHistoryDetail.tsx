import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Target,
  List,
  TrendingUp,
  User,
  History
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useRuleStore } from '../store/ruleStore';
import { useAnomalyStore } from '../store/anomalyStore';
import Badge from '../components/common/Badge';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ANOMALY_STATUS_LABELS } from '../types';

export default function InspectionHistoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInspectionById } = useAppStore();
  const { getRuleById } = useRuleStore();
  const { getRecordsByAnomalyId } = useAnomalyStore();

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

  const hitRules = inspection.hitRuleIds
    .map((ruleId) => getRuleById(ruleId))
    .filter(Boolean);
  
  const duration = inspection.endTime
    ? Math.round((new Date(inspection.endTime).getTime() - new Date(inspection.startTime).getTime()) / 1000)
    : null;

  const snapshotsByStatus = {
    critical: inspection.anomalySnapshots.filter(a => a.level === 'critical'),
    warning: inspection.anomalySnapshots.filter(a => a.level === 'warning'),
    info: inspection.anomalySnapshots.filter(a => a.level === 'info'),
  };

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
            <p className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {inspection.operatorName}
            </p>
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
            <span>开始: {format(new Date(inspection.startTime), 'HH:mm:ss', { locale: zhCN })}</span>
          </div>
          {inspection.endTime && (
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4" />
              <span>结束: {format(new Date(inspection.endTime), 'HH:mm:ss', { locale: zhCN })}</span>
            </div>
          )}
          {inspection.shopName && (
            <div className="flex items-center gap-2 text-slate-600">
              <Target className="w-4 h-4" />
              <span>店铺: {inspection.shopName}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-600">
            <List className="w-4 h-4" />
            <span>快照数: {inspection.anomalySnapshots.length}个</span>
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
            <h3 className="font-semibold text-slate-900">异常快照</h3>
            <span className="ml-auto text-sm text-slate-500">{inspection.anomalySnapshots.length}条</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {inspection.anomalySnapshots.length > 0 ? (
              inspection.anomalySnapshots.map((snapshot) => {
                const processingRecords = getRecordsByAnomalyId(snapshot.id);
                const hasProcessingHistory = processingRecords.length > 0;
                return (
                <div key={snapshot.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        snapshot.level === 'critical' ? 'bg-red-100 text-red-600' :
                        snapshot.level === 'warning' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{snapshot.title}</p>
                        <p className="text-sm text-slate-500 truncate max-w-xs">{snapshot.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="level" value={snapshot.level} />
                      <Badge variant="status" value={snapshot.status} />
                    </div>
                  </div>
                  <div className="ml-11 grid grid-cols-3 gap-2 text-xs text-slate-500">
                    <div>
                      <span className="text-slate-400">处理人:</span> {snapshot.assigneeName || '未指派'}
                    </div>
                    <div>
                      <span className="text-slate-400">当时状态:</span> {ANOMALY_STATUS_LABELS[snapshot.status]}
                    </div>
                    <div>
                      <span className="text-slate-400">实际值:</span> {snapshot.actualValue}
                    </div>
                  </div>
                  {snapshot.resolution && (
                    <div className="ml-11 mt-2 p-2 bg-slate-50 rounded text-xs">
                      <span className="text-slate-400">处理说明:</span> {snapshot.resolution}
                    </div>
                  )}
                  {hasProcessingHistory && (
                    <div className="ml-11 mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <History className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs text-slate-500 font-medium">后续处理记录</span>
                      </div>
                      <div className="space-y-2">
                        {processingRecords.slice(0, 3).map((record) => (
                          <div key={record.id} className="flex items-start gap-2 text-xs">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                              record.action === 'resolved' ? 'bg-green-500' :
                              record.action === 'ignored' ? 'bg-slate-400' :
                              record.action === 'assigned' ? 'bg-blue-500' :
                              'bg-orange-500'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-700">{record.operatorName}</span>
                                <span className="text-slate-400">{
                                  record.action === 'assigned' ? '指派' :
                                  record.action === 'resolved' ? '解决' :
                                  record.action === 'ignored' ? '忽略' :
                                  record.action === 'level_changed' ? '改级别' :
                                  '备注'
                                }</span>
                                {record.newValue && record.newValue !== record.operatorName && (
                                  <span className="text-blue-600">{record.newValue}</span>
                                )}
                              </div>
                              {record.comment && (
                                <p className="text-slate-500 mt-0.5 truncate">{record.comment}</p>
                              )}
                              <p className="text-slate-400 mt-0.5">
                                {format(new Date(record.createdAt), 'MM-dd HH:mm', { locale: zhCN })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )})
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
        <h3 className="font-semibold text-slate-900 mb-4">异常级别分布（巡检时快照）</h3>
        <div className="flex items-end gap-4 h-32">
          <div className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg transition-all"
              style={{ height: `${Math.max(20, (snapshotsByStatus.critical.length / Math.max(inspection.anomaliesFound, 1)) * 100)}%` }}
            ></div>
            <p className="text-sm font-medium text-slate-700 mt-2">{snapshotsByStatus.critical.length}</p>
            <p className="text-xs text-slate-500">严重</p>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg transition-all"
              style={{ height: `${Math.max(20, (snapshotsByStatus.warning.length / Math.max(inspection.anomaliesFound, 1)) * 100)}%` }}
            ></div>
            <p className="text-sm font-medium text-slate-700 mt-2">{snapshotsByStatus.warning.length}</p>
            <p className="text-xs text-slate-500">警告</p>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all"
              style={{ height: `${Math.max(20, (snapshotsByStatus.info.length / Math.max(inspection.anomaliesFound, 1)) * 100)}%` }}
            ></div>
            <p className="text-sm font-medium text-slate-700 mt-2">{snapshotsByStatus.info.length}</p>
            <p className="text-xs text-slate-500">提示</p>
          </div>
        </div>
      </div>
    </div>
  );
}
