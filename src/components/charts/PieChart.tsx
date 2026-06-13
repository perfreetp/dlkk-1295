import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface PieChartProps {
  data: { type: string; value: number; color: string }[];
  height?: number;
}

export default function PieChart({ data, height = 300 }: PieChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: {
          color: '#334155',
        },
        formatter: '{b}: {c}%',
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        formatter: (name) => {
          const item = data.find((d) => d.type === name);
          return `{name|${name}} {value|${item?.value || 0}%}`;
        },
        textStyle: {
          rich: {
            name: {
              color: '#64748b',
            },
            value: {
              color: '#334155',
              fontWeight: 'bold',
              padding: [0, 0, 0, 8],
            },
          },
        },
      },
      series: [
        {
          name: '异常类型分布',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 3,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
            },
          },
          labelLine: {
            show: false,
          },
          data: data.map((d) => ({
            value: d.value,
            name: d.type,
            itemStyle: {
              color: d.color,
            },
          })),
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
