import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Copy,
  Bell,
  Settings,
  X,
  Target
} from 'lucide-react';
import { useAnomalyStore } from '../store/anomalyStore';
import { useAppStore } from '../store/appStore';
import { useRuleStore } from '../store/ruleStore';
import { RULE_TYPE_OPTIONS } from '../store/ruleStore';
import { ReportSubscription } from '../types';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { zhCN } from 'date-fns/locale';

type ReportType = 'daily' | 'weekly' | 'monthly';

export default function Reports() {
  const { anomalies } = useAnomalyStore();
  const { shops, users, currentUser, subscription: savedSubscription, updateSubscription, getSubscription } = useAppStore();
  const { rules } = useRuleStore();
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedShopId, setSelectedShopId] = useState('');
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const [subscription, setSubscription] = useState<ReportSubscription>(getSubscription);

  useEffect(() => {
    setSubscription(getSubscription());
  }, [savedSubscription]);

  const getDateRange = () => {
    const date = new Date(selectedDate);
    switch (reportType) {
      case 'daily':
        return { start: startOfDay(date), end: endOfDay(date) };
      case 'weekly':
        return { start: startOfWeek(date, { locale: zhCN }), end: endOfWeek(date, { locale: zhCN }) };
      case 'monthly':
        return { start: startOfMonth(date), end: endOfMonth(date) };
    }
  };

  const dateRange = getDateRange();
  
  const periodAnomalies = anomalies.filter((a) => {
    const anomalyDate = new Date(a.createdAt);
    const inDateRange = anomalyDate >= dateRange.start && anomalyDate <= dateRange.end;
    const matchShop = !selectedShopId || a.shopId === selectedShopId;
    return inDateRange && matchShop;
  });

  const periodPending = periodAnomalies.filter((a) => a.status === 'pending');
  const periodProcessing = periodAnomalies.filter((a) => a.status === 'processing');
  const periodResolved = periodAnomalies.filter((a) => a.status === 'resolved');
  const periodIgnored = periodAnomalies.filter((a) => a.status === 'ignored');

  const periodTypeStats = RULE_TYPE_OPTIONS.map((type) => ({
    type: type.label,
    count: periodAnomalies.filter((a) => a.type === type.value).length,
  }));

  const shop = selectedShopId ? shops.find((s) => s.id === selectedShopId) : null;

  const generateReport = () => {
    let dateStr = '';
    switch (reportType) {
      case 'daily':
        dateStr = format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN });
        break;
      case 'weekly':
        dateStr = `${format(dateRange.start, 'yyyy年MM月dd日', { locale: zhCN })} - ${format(dateRange.end, 'MM月dd日', { locale: zhCN })}`;
        break;
      case 'monthly':
        dateStr = format(selectedDate, 'yyyy年MM月', { locale: zhCN });
        break;
    }

    const periodLabel = reportType === 'daily' ? '日' : reportType === 'weekly' ? '周' : '月';
    const shopInfo = shop ? `\n巡检店铺: ${shop.name}` : '\n巡检店铺: 全部店铺';
    
    const reportContent = `
=== 数据巡检${periodLabel}报 ===

报告周期: ${dateStr}
生成时间: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}${shopInfo}

一、巡检概况
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
本${periodLabel}共发现 ${periodAnomalies.length} 个异常，其中：
- 待处理: ${periodPending.length} 个
- 处理中: ${periodProcessing.length} 个
- 已解决: ${periodResolved.length} 个
- 已忽略: ${periodIgnored.length} 个
${periodAnomalies.length > 0 ? `- 异常解决率: ${Math.round((periodResolved.length / periodAnomalies.length) * 100)}%` : ''}

二、异常类型分布
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${periodTypeStats.filter((s) => s.count > 0).map((s) => `- ${s.type}: ${s.count} 个`).join('\n') || '本周期无异常'}

三、重点异常
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${periodAnomalies.filter((a) => a.level === 'critical').length > 0 
  ? periodAnomalies
      .filter((a) => a.level === 'critical')
      .slice(0, 5)
      .map((a, i) => {
        const handler = a.assigneeName || '未指派';
        const handlerInfo = a.resolution ? `\n   处理人: ${handler}\n   处理说明: ${a.resolution}` : `\n   处理人: ${handler}`;
        return `${i + 1}. [${a.level === 'critical' ? '严重' : a.level === 'warning' ? '警告' : '提示'}] ${a.title}\n   ${a.description}\n   店铺: ${shops.find((s) => s.id === a.shopId)?.name || '未知'}\n   状态: ${a.status === 'pending' ? '待处理' : a.status === 'processing' ? '处理中' : a.status === 'resolved' ? '已解决' : '已忽略'}${handlerInfo}`;
      })
      .join('\n\n')
  : '本周期无严重级别异常'}

四、处理建议
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${periodPending.length > 0 
  ? `1. 优先处理 ${periodPending.length} 个待处理异常\n2. 关注库存为负和价格异常类问题\n3. 及时跟进处理中的异常`
  : '本周期所有异常均已处理完成，继续保持！'}

五、附录
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 监控店铺数: ${shops.filter((s) => s.status === 'active').length}
- 活跃规则数: ${rules.filter(r => r.enabled).length}
- 报告生成人: ${currentUser?.name || '系统'}

===========================================
    `.trim();

    setGeneratedReport(reportContent);
  };

  const handleCopy = () => {
    if (generatedReport) {
      navigator.clipboard.writeText(generatedReport);
      alert('报告已复制到剪贴板');
    }
  };

  const handleDownload = () => {
    if (generatedReport) {
      const blob = new Blob([generatedReport], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const periodLabel = reportType === 'daily' ? '日报' : reportType === 'weekly' ? '周报' : '月报';
      const shopSuffix = shop ? `_${shop.name}` : '';
      link.download = `数据巡检${periodLabel}${shopSuffix}_${format(selectedDate, 'yyyyMMdd')}.txt`;
      link.click();
    }
  };

  const saveSubscription = () => {
    updateSubscription(subscription);
    setShowSubscriptionModal(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          报告生成
        </h1>
        <p className="text-slate-500 mt-1">生成数据巡检日报、周报和月报</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              报告设置
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">报告类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['daily', 'weekly', 'monthly'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setReportType(type);
                        setGeneratedReport(null);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        reportType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {type === 'daily' ? '日报' : type === 'weekly' ? '周报' : '月报'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">巡检店铺</label>
                <select
                  value={selectedShopId}
                  onChange={(e) => {
                    setSelectedShopId(e.target.value);
                    setGeneratedReport(null);
                  }}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部店铺</option>
                  {shops.filter(s => s.status === 'active').map((shop) => (
                    <option key={shop.id} value={shop.id}>{shop.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">报告日期</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => {
                      setSelectedDate(new Date(e.target.value));
                      setGeneratedReport(null);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={generateReport}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                <FileText className="w-5 h-5" />
                生成报告
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">
              {reportType === 'daily' ? '今日' : reportType === 'weekly' ? '本周' : '本月'}统计
              {shop && <span className="text-sm font-normal text-slate-500 ml-2">({shop.name})</span>}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-slate-700">发现异常</span>
                </div>
                <span className="font-semibold text-red-600">{periodAnomalies.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-slate-700">待处理</span>
                </div>
                <span className="font-semibold text-orange-600">{periodPending.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-slate-700">已解决</span>
                </div>
                <span className="font-semibold text-green-600">{periodResolved.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                消息订阅
              </h3>
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="space-y-3">
              {(['daily', 'weekly', 'monthly'] as const).map((type) => {
                const sub = subscription[type];
                const label = type === 'daily' ? '日报' : type === 'weekly' ? '周报' : '月报';
                const recipients = users.filter(u => sub.userIds.includes(u.id)).map(u => u.name);
                return (
                  <div key={type} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${sub.enabled ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                      <span className="text-sm text-slate-700">{label}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${sub.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {sub.enabled ? '已开启' : '未开启'}
                      </span>
                      {sub.enabled && sub.lastSentAt && (
                        <p className="text-xs text-slate-400 mt-1">
                          最近: {format(new Date(sub.lastSentAt), 'MM-dd HH:mm', { locale: zhCN })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                报告预览
              </h3>
              {generatedReport && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    复制
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    下载
                  </button>
                </div>
              )}
            </div>
            <div className="p-6">
              {generatedReport ? (
                <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 bg-slate-50 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                  {generatedReport}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <FileText className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">暂无报告</p>
                  <p className="text-sm">请设置报告参数并点击"生成报告"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-slate-900">订阅设置</h2>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {(['daily', 'weekly', 'monthly'] as const).map((type) => {
                const label = type === 'daily' ? '日报' : type === 'weekly' ? '周报' : '月报';
                const sub = subscription[type];
                return (
                  <div key={type} className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-slate-900">{label}订阅</h4>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sub.enabled}
                          onChange={(e) => setSubscription({
                            ...subscription,
                            [type]: { ...sub, enabled: e.target.checked },
                          })}
                          className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-slate-700">
                          {sub.enabled ? '已开启' : '已关闭'}
                        </span>
                      </label>
                    </div>
                    
                    {sub.enabled && (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-slate-700 mb-2">接收方式</label>
                          <div className="flex gap-4">
                            {['站内信', '邮件', '短信'].map((method) => (
                              <label key={method} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={sub.methods.includes(method)}
                                  onChange={(e) => {
                                    const newMethods = e.target.checked
                                      ? [...sub.methods, method]
                                      : sub.methods.filter((m) => m !== method);
                                    setSubscription({
                                      ...subscription,
                                      [type]: { ...sub, methods: newMethods },
                                    });
                                  }}
                                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700">{method}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">接收人</label>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {users.filter(u => u.role === 'operator' || u.role === 'admin').map((user) => (
                              <label key={user.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
                                <input
                                  type="checkbox"
                                  checked={sub.userIds.includes(user.id)}
                                  onChange={(e) => {
                                    const newUserIds = e.target.checked
                                      ? [...sub.userIds, user.id]
                                      : sub.userIds.filter((id) => id !== user.id);
                                    setSubscription({
                                      ...subscription,
                                      [type]: { ...sub, userIds: newUserIds },
                                    });
                                  }}
                                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700">{user.name}</span>
                                <span className="text-xs text-slate-400">
                                  ({user.role === 'admin' ? '管理员' : '运营专员'})
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {sub.lastSentAt && (
                          <p className="text-xs text-slate-400 mt-3">
                            最近发送: {format(new Date(sub.lastSentAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="px-5 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={saveSubscription}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
