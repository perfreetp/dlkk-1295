import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Copy,
  Share2
} from 'lucide-react';
import { useAnomalyStore } from '../store/anomalyStore';
import { useAppStore } from '../store/appStore';
import { RULE_TYPE_OPTIONS } from '../store/ruleStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Reports() {
  const { anomalies } = useAnomalyStore();
  const { shops } = useAppStore();
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayAnomalies = anomalies.filter((a) => {
    const anomalyDate = new Date(a.createdAt);
    anomalyDate.setHours(0, 0, 0, 0);
    return anomalyDate.getTime() === today.getTime();
  });

  const pendingAnomalies = anomalies.filter((a) => a.status === 'pending');
  const processingAnomalies = anomalies.filter((a) => a.status === 'processing');
  const resolvedAnomalies = anomalies.filter((a) => a.status === 'resolved');

  const anomalyTypeStats = RULE_TYPE_OPTIONS.map((type) => ({
    type: type.label,
    count: todayAnomalies.filter((a) => a.type === type.value).length,
  }));

  const generateReport = () => {
    const dateStr = format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN });
    const reportContent = `
=== 数据巡检${reportType === 'daily' ? '日报' : reportType === 'weekly' ? '周报' : '月报'} ===

报告日期: ${dateStr}
生成时间: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}

一、巡检概况
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
本次巡检共发现 ${todayAnomalies.length} 个异常，其中：
- 待处理: ${pendingAnomalies.length} 个
- 处理中: ${processingAnomalies.length} 个
- 已解决: ${resolvedAnomalies.length} 个
- 异常解决率: ${anomalies.length > 0 ? Math.round((resolvedAnomalies.length / anomalies.length) * 100) : 0}%

二、异常类型分布
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${anomalyTypeStats.filter((s) => s.count > 0).map((s) => `- ${s.type}: ${s.count} 个`).join('\n')}

三、重点异常
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${todayAnomalies.filter((a) => a.level === 'critical').length > 0 ? todayAnomalies
  .filter((a) => a.level === 'critical')
  .slice(0, 3)
  .map((a, i) => `${i + 1}. [${a.level === 'critical' ? '严重' : a.level === 'warning' ? '警告' : '提示'}] ${a.title}\n   ${a.description}\n   店铺: ${shops.find((s) => s.id === a.shopId)?.name || '未知'}`)
  .join('\n\n') : '无严重级别异常'}

四、处理建议
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${pendingAnomalies.length > 0 ? `1. 优先处理 ${pendingAnomalies.length} 个待处理异常\n2. 关注库存为负和价格异常类问题\n3. 及时跟进处理中的异常` : '所有异常均已处理完成，继续保持！'}

五、附录
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 监控店铺数: ${shops.filter((s) => s.status === 'active').length}
- 活跃规则数: ${anomalies.length}
- 报告生成人: ${useAppStore.getState().currentUser?.name || '系统'}

===========================================
报告结束
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
      link.download = `数据巡检${reportType === 'daily' ? '日报' : reportType === 'weekly' ? '周报' : '月报'}_${format(selectedDate, 'yyyyMMdd')}.txt`;
      link.click();
    }
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
                      onClick={() => setReportType(type)}
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
                <label className="block text-sm font-medium text-slate-700 mb-2">报告日期</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
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
            <h3 className="font-semibold text-slate-900 mb-4">今日统计</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-slate-700">今日异常</span>
                </div>
                <span className="font-semibold text-red-600">{todayAnomalies.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-slate-700">待处理</span>
                </div>
                <span className="font-semibold text-orange-600">{pendingAnomalies.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-slate-700">已解决</span>
                </div>
                <span className="font-semibold text-green-600">{resolvedAnomalies.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
            <h3 className="font-semibold mb-2">订阅消息提醒</h3>
            <p className="text-sm text-purple-100 mb-4">
              开启订阅后，新异常将会通过邮件或站内信及时通知您
            </p>
            <button className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors">
              立即订阅
            </button>
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
    </div>
  );
}
