import { AlertLevel, AnomalyStatus } from '../../types';

interface BadgeProps {
  variant: 'level' | 'status' | 'custom';
  value: AlertLevel | AnomalyStatus | string;
  className?: string;
}

const levelStyles: Record<AlertLevel, { bg: string; text: string; dot: string }> = {
  critical: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  warning: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  info: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
};

const statusStyles: Record<AnomalyStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-slate-100', text: 'text-slate-700' },
  processing: { bg: 'bg-blue-100', text: 'text-blue-700' },
  resolved: { bg: 'bg-green-100', text: 'text-green-700' },
  ignored: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

const statusLabels: Record<AnomalyStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
  ignored: '已忽略',
};

const levelLabels: Record<AlertLevel, string> = {
  critical: '严重',
  warning: '警告',
  info: '提示',
};

export default function Badge({ variant, value, className = '' }: BadgeProps) {
  if (variant === 'level') {
    const style = levelStyles[value as AlertLevel];
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
        {levelLabels[value as AlertLevel]}
      </span>
    );
  }

  if (variant === 'status') {
    const style = statusStyles[value as AnomalyStatus];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} ${className}`}
      >
        {statusLabels[value as AnomalyStatus]}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 ${className}`}>
      {value}
    </span>
  );
}
