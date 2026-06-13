import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertTriangle, 
  Package, 
  ShoppingCart, 
  Clock,
  User,
  CheckCircle,
  XCircle,
  MessageSquare,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAnomalyStore } from '../store/anomalyStore';
import { useAppStore } from '../store/appStore';
import { useRuleStore, RULE_TYPE_OPTIONS, ALERT_LEVEL_OPTIONS } from '../store/ruleStore';
import { products, orders } from '../data/mockData';
import { AlertLevel } from '../types';
import Badge from '../components/common/Badge';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function AnomalyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAnomalyById, getRecordsByAnomalyId, assignAnomaly, resolveAnomaly, ignoreAnomaly, changeAnomalyLevel } = useAnomalyStore();
  const { shops, users } = useAppStore();
  const { getRuleById } = useRuleStore();
  
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [resolution, setResolution] = useState('');
  const [expandedProducts, setExpandedProducts] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState(true);
  const [expandedHistory, setExpandedHistory] = useState(true);

  const anomaly = getAnomalyById(id || '');
  const records = getRecordsByAnomalyId(id || '');
  const rule = anomaly ? getRuleById(anomaly.ruleId) : null;
  const shop = anomaly ? shops.find((s) => s.id === anomaly.shopId) : null;
  
  const relatedProducts = anomaly?.productIds.map((pid) => products.find((p) => p.id === pid)).filter(Boolean) || [];
  const relatedOrders = anomaly?.orderIds.map((oid) => orders.find((o) => o.id === oid)).filter(Boolean) || [];

  if (!anomaly) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">异常记录不存在</h2>
        <p className="text-slate-500 mb-6">该异常记录可能被删除或不存在</p>
        <Link
          to="/anomalies"
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          返回异常列表
        </Link>
      </div>
    );
  }

  const handleAssign = () => {
    if (selectedUser) {
      const user = users.find((u) => u.id === selectedUser);
      if (user) {
        assignAnomaly(anomaly.id, user.id, user.name);
        setShowAssignModal(false);
        setSelectedUser('');
      }
    }
  };

  const handleResolve = () => {
    if (resolution.trim()) {
      resolveAnomaly(anomaly.id, resolution);
      setShowResolveModal(false);
      setResolution('');
    }
  };

  const handleIgnore = () => {
    if (confirm('确定要忽略此异常吗？')) {
      ignoreAnomaly(anomaly.id, '已手动忽略');
    }
  };

  const handleChangeLevel = (level: AlertLevel) => {
    changeAnomalyLevel(anomaly.id, level);
    setShowLevelModal(false);
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'assigned': return '已指派';
      case 'level_changed': return '级别变更';
      case 'resolved': return '已解决';
      case 'comment': return '备注';
      case 'ignored': return '已忽略';
      default: return action;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/anomalies')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            异常详情
          </h1>
          <p className="text-slate-500 mt-1">ID: {anomaly.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className={`p-4 rounded-xl ${
                anomaly.level === 'critical' ? 'bg-red-100 text-red-600' :
                anomaly.level === 'warning' ? 'bg-orange-100 text-orange-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-slate-900">{anomaly.title}</h2>
                  <Badge variant="level" value={anomaly.level} />
                  <Badge variant="status" value={anomaly.status} />
                </div>
                <p className="text-slate-600">{anomaly.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500 mb-1">异常类型</p>
                <p className="font-semibold text-slate-900">
                  {RULE_TYPE_OPTIONS.find((t) => t.value === anomaly.type)?.label}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500 mb-1">关联店铺</p>
                <p className="font-semibold text-slate-900">{shop?.name || '-'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500 mb-1">触发阈值</p>
                <p className="font-semibold text-slate-900">{anomaly.threshold}{rule?.unit}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500 mb-1">实际值</p>
                <p className="font-semibold text-slate-900">{anomaly.actualValue}{rule?.unit}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button
              onClick={() => setExpandedProducts(!expandedProducts)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-slate-900">关联商品</span>
                <span className="text-sm text-slate-400">({relatedProducts.length})</span>
              </div>
              {expandedProducts ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </button>
            {expandedProducts && (
              <div className="border-t border-slate-100">
                {relatedProducts.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {relatedProducts.map((product) => product && (
                      <div key={product.id} className="p-4 flex items-center gap-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{product.name}</p>
                          <p className="text-sm text-slate-500 mt-1">ID: {product.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">¥{product.price}</p>
                          <p className="text-sm text-slate-500 mt-1">库存: {product.inventory}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>暂无关联商品</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button
              onClick={() => setExpandedOrders(!expandedOrders)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-slate-900">关联订单</span>
                <span className="text-sm text-slate-400">({relatedOrders.length})</span>
              </div>
              {expandedOrders ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </button>
            {expandedOrders && (
              <div className="border-t border-slate-100">
                {relatedOrders.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {relatedOrders.map((order) => order && (
                      <div key={order.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900">{order.orderNo}</span>
                          <span className="font-semibold text-slate-900">¥{order.amount}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>客户: {order.userName}</span>
                          <span>商品数: {order.quantity}</span>
                          <span>{format(new Date(order.createdAt), 'MM-dd HH:mm', { locale: zhCN })}</span>
                        </div>
                        {order.coupons.length > 0 && (
                          <div className="mt-2 flex gap-2">
                            {order.coupons.map((coupon, idx) => (
                              <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                {coupon}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>暂无关联订单</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button
              onClick={() => setExpandedHistory(!expandedHistory)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-slate-900">处理历史</span>
                <span className="text-sm text-slate-400">({records.length})</span>
              </div>
              {expandedHistory ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </button>
            {expandedHistory && (
              <div className="border-t border-slate-100">
                {records.length > 0 ? (
                  <div className="p-4 space-y-4">
                    {records.map((record) => (
                      <div key={record.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                            {record.action === 'resolved' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : record.action === 'assigned' ? (
                              <User className="w-4 h-4 text-blue-600" />
                            ) : record.action === 'comment' ? (
                              <MessageSquare className="w-4 h-4 text-slate-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-600" />
                            )}
                          </div>
                          <div className="w-0.5 h-full bg-slate-200 mt-2"></div>
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-900">{record.operatorName}</span>
                            <span className="text-sm text-slate-500">{getActionLabel(record.action)}</span>
                            {record.newValue && record.action !== 'comment' && (
                              <span className="text-sm text-blue-600">→ {record.newValue}</span>
                            )}
                          </div>
                          {record.comment && (
                            <p className="text-sm text-slate-600 mt-1">{record.comment}</p>
                          )}
                          <p className="text-xs text-slate-400 mt-2">
                            {format(new Date(record.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>暂无处理记录</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">处理操作</h3>
            <div className="space-y-3">
              {anomaly.status !== 'resolved' && anomaly.status !== 'ignored' && (
                <>
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-700 font-medium transition-colors"
                  >
                    <User className="w-5 h-5" />
                    {anomaly.assigneeName ? '更换处理人' : '指派处理人'}
                  </button>
                  <button
                    onClick={() => setShowResolveModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 rounded-xl text-green-700 font-medium transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    标记为已解决
                  </button>
                  <button
                    onClick={() => setShowLevelModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-xl text-orange-700 font-medium transition-colors"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    修改告警级别
                  </button>
                  <button
                    onClick={handleIgnore}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 font-medium transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    忽略此异常
                  </button>
                </>
              )}
              {anomaly.status === 'resolved' && (
                <div className="p-4 bg-green-50 rounded-xl text-green-700 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">此异常已解决</p>
                  {anomaly.resolution && (
                    <p className="text-sm mt-2 opacity-80">{anomaly.resolution}</p>
                  )}
                </div>
              )}
              {anomaly.status === 'ignored' && (
                <div className="p-4 bg-slate-100 rounded-xl text-slate-700 text-center">
                  <XCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">此异常已忽略</p>
                  {anomaly.resolution && (
                    <p className="text-sm mt-2 opacity-80">{anomaly.resolution}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">基本信息</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">创建时间</span>
                <span className="text-slate-900">
                  {format(new Date(anomaly.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">处理人</span>
                <span className="text-slate-900">{anomaly.assigneeName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">处理时间</span>
                <span className="text-slate-900">
                  {anomaly.handledAt ? format(new Date(anomaly.handledAt), 'yyyy-MM-dd HH:mm', { locale: zhCN }) : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">偏差值</span>
                <span className="text-slate-900">{anomaly.deviation}{rule?.unit}</span>
              </div>
            </div>
          </div>

          <Link
            to="/reports"
            className="block bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            <h3 className="font-semibold mb-2">生成异常报告</h3>
            <p className="text-sm text-purple-100">将此异常包含在日报或周报中</p>
          </Link>
        </div>
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">指派处理人</h2>
            </div>
            <div className="p-6">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">选择处理人员</option>
                {users.filter((u) => u.role === 'operator' || u.role === 'admin').map((user) => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-5 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedUser}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认指派
              </button>
            </div>
          </div>
        </div>
      )}

      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">填写处理结论</h2>
            </div>
            <div className="p-6">
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="请输入异常的处理结论..."
              />
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-5 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleResolve}
                disabled={!resolution.trim()}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认解决
              </button>
            </div>
          </div>
        </div>
      )}

      {showLevelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">修改告警级别</h2>
            </div>
            <div className="p-6 space-y-3">
              {ALERT_LEVEL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleChangeLevel(opt.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                    anomaly.level === opt.value
                      ? opt.color === 'red' ? 'bg-red-100 text-red-700' :
                        opt.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${
                    opt.color === 'red' ? 'bg-red-500' :
                    opt.color === 'orange' ? 'bg-orange-500' :
                    'bg-blue-500'
                  }`}></span>
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowLevelModal(false)}
                className="px-5 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
