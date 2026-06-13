import { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Power, 
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Percent,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { useRuleStore, RULE_TYPE_OPTIONS, ALERT_LEVEL_OPTIONS } from '../store/ruleStore';
import { InspectionRule, RuleType, AlertLevel } from '../types';
import Badge from '../components/common/Badge';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const ruleTypeIcons: Record<RuleType, React.ElementType> = {
  inventory_negative: AlertTriangle,
  price_drop: TrendingDown,
  order_surge: TrendingUp,
  coupon_stacking: Percent,
  unit_price_anomaly: DollarSign,
  refund_rate_anomaly: ShoppingCart,
};

export default function Rules() {
  const { rules, addRule, updateRule, deleteRule, toggleRule } = useRuleStore();
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<InspectionRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'inventory_negative' as RuleType,
    threshold: 0,
    unit: '',
    level: 'warning' as AlertLevel,
    enabled: true,
    priority: 1,
    description: '',
  });

  const handleOpenModal = (rule?: InspectionRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        type: rule.type,
        threshold: rule.threshold,
        unit: rule.unit,
        level: rule.level,
        enabled: rule.enabled,
        priority: rule.priority,
        description: rule.description,
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        type: 'inventory_negative',
        threshold: 0,
        unit: '',
        level: 'warning',
        enabled: true,
        priority: rules.length + 1,
        description: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRule(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRule) {
      updateRule(editingRule.id, formData);
    } else {
      addRule(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条规则吗？')) {
      deleteRule(id);
    }
  };

  const enabledRules = rules.filter((r) => r.enabled);
  const disabledRules = rules.filter((r) => !r.enabled);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            巡检规则配置
          </h1>
          <p className="text-slate-500 mt-1">配置和管理数据巡检规则，实时监控异常情况</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          新增规则
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-blue-100 text-sm mb-1">已启用规则</p>
          <p className="text-3xl font-bold">{enabledRules.length}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-slate-200 text-sm mb-1">已停用规则</p>
          <p className="text-3xl font-bold">{disabledRules.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-purple-100 text-sm mb-1">规则总数</p>
          <p className="text-3xl font-bold">{rules.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">全部规则</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {rules.map((rule) => {
            const Icon = ruleTypeIcons[rule.type];
            return (
              <div key={rule.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    rule.enabled 
                      ? rule.level === 'critical' ? 'bg-red-100 text-red-600' :
                        rule.level === 'warning' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`font-semibold ${rule.enabled ? 'text-slate-900' : 'text-slate-400'}`}>
                        {rule.name}
                      </h3>
                      <Badge variant="level" value={rule.level} />
                      {!rule.enabled && (
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">已停用</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mb-2">{rule.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>阈值: {rule.threshold}{rule.unit}</span>
                      <span>优先级: {rule.priority}</span>
                      <span>类型: {RULE_TYPE_OPTIONS.find(t => t.value === rule.type)?.label}</span>
                      <span>更新: {format(new Date(rule.updatedAt), 'MM-dd HH:mm', { locale: zhCN })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        rule.enabled
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-slate-400 hover:bg-slate-100'
                      }`}
                      title={rule.enabled ? '停用规则' : '启用规则'}
                    >
                      <Power className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleOpenModal(rule)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="编辑规则"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除规则"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {rules.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无规则配置</p>
              <button
                onClick={() => handleOpenModal()}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                添加第一条规则
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingRule ? '编辑规则' : '新增规则'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">规则名称</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入规则名称"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">规则类型</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as RuleType })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {RULE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">告警级别</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as AlertLevel })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {ALERT_LEVEL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">阈值</label>
                  <input
                    type="number"
                    required
                    value={formData.threshold}
                    onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">单位</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="如: 件, %, 元"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">优先级</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">启用此规则</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">规则描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="请输入规则描述"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  {editingRule ? '保存修改' : '创建规则'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
