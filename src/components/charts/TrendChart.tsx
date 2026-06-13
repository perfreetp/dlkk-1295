import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface TrendChartProps {
  data: { date: string; anomalies: number; resolved: number }[];
  height?: number;
}

export default function TrendChart({ data, height = 300 }: TrendChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);
    
    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: {
          color: '#334155',
        },
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999',
          },
        },
      },
      legend: {
        data: ['异常数量', '已解决'],
        bottom: 0,
        textStyle: {
          color: '#64748b',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.date),
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#e2e8f0',
          },
        },
        axisLabel: {
          color: '#64748b',
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false,
        },
        splitLine: {
          lineStyle: {
            color: '#f1f5f9',
          },
        },
        axisLabel: {
          color: '#64748b',
        },
      },
      series: [
        {
          name: '异常数量',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          data: data.map((d) => d.anomalies),
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#8b5cf6' },
            ]),
          },
          itemStyle: {
            color: '#3b82f6',
            borderWidth: 2,
            borderColor: '#fff',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
            ]),
          },
        },
        {
          name: '已解决',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          data: data.map((d) => d.resolved),
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: '#34d399' },
            ]),
          },
          itemStyle: {
            color: '#10b981',
            borderWidth: 2,
            borderColor: '#fff',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' },
            ]),
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [data]);

  return <div ref={chartRef} style={{ height: `${height}px`, width: '100%' }}></div>;
}
