import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Settings, 
  AlertTriangle,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Data for 1 month
const revenueData1M = [
  { month: 'W1', revenue: 18000000 },
  { month: 'W2', revenue: 21000000 },
  { month: 'W3', revenue: 19000000 },
  { month: 'W4', revenue: 23000000 },
];

const successRateData1M = [
  { month: 'W1', rate: 88 },
  { month: 'W2', rate: 90 },
  { month: 'W3', rate: 89 },
  { month: 'W4', rate: 91 },
];

// Data for 3 months
const revenueData3M = [
  { month: 'T1', revenue: 45000000 },
  { month: 'T2', revenue: 48000000 },
  { month: 'T3', revenue: 52000000 },
];

const successRateData3M = [
  { month: 'T1', rate: 87 },
  { month: 'T2', rate: 89 },
  { month: 'T3', rate: 90 },
];

// Data for 6 months
const revenueData6M = [
  { month: 'T1', revenue: 45000000 },
  { month: 'T2', revenue: 52000000 },
  { month: 'T3', revenue: 48000000 },
  { month: 'T4', revenue: 61000000 },
  { month: 'T5', revenue: 55000000 },
  { month: 'T6', revenue: 67000000 },
];

const successRateData6M = [
  { month: 'T1', rate: 85 },
  { month: 'T2', rate: 88 },
  { month: 'T3', rate: 90 },
  { month: 'T4', rate: 87 },
  { month: 'T5', rate: 92 },
  { month: 'T6', rate: 91 },
];

// Data for 9 months
const revenueData9M = [
  { month: 'T1', revenue: 45000000 },
  { month: 'T2', revenue: 52000000 },
  { month: 'T3', revenue: 48000000 },
  { month: 'T4', revenue: 61000000 },
  { month: 'T5', revenue: 55000000 },
  { month: 'T6', revenue: 67000000 },
  { month: 'T7', revenue: 58000000 },
  { month: 'T8', revenue: 64000000 },
  { month: 'T9', revenue: 72000000 },
];

const successRateData9M = [
  { month: 'T1', rate: 85 },
  { month: 'T2', rate: 88 },
  { month: 'T3', rate: 90 },
  { month: 'T4', rate: 87 },
  { month: 'T5', rate: 92 },
  { month: 'T6', rate: 91 },
  { month: 'T7', rate: 89 },
  { month: 'T8', rate: 93 },
  { month: 'T9', rate: 94 },
];

// Data for 12 months
const revenueData12M = [
  { month: 'T1', revenue: 45000000 },
  { month: 'T2', revenue: 52000000 },
  { month: 'T3', revenue: 48000000 },
  { month: 'T4', revenue: 61000000 },
  { month: 'T5', revenue: 55000000 },
  { month: 'T6', revenue: 67000000 },
  { month: 'T7', revenue: 58000000 },
  { month: 'T8', revenue: 64000000 },
  { month: 'T9', revenue: 72000000 },
  { month: 'T10', revenue: 68000000 },
  { month: 'T11', revenue: 75000000 },
  { month: 'T12', revenue: 82000000 },
];

const successRateData12M = [
  { month: 'T1', rate: 85 },
  { month: 'T2', rate: 88 },
  { month: 'T3', rate: 90 },
  { month: 'T4', rate: 87 },
  { month: 'T5', rate: 92 },
  { month: 'T6', rate: 91 },
  { month: 'T7', rate: 89 },
  { month: 'T8', rate: 93 },
  { month: 'T9', rate: 94 },
  { month: 'T10', rate: 91 },
  { month: 'T11', rate: 95 },
  { month: 'T12', rate: 93 },
];

const machineTypeData = [
  { name: '50 trứng', value: 120, color: '#3b82f6' },
  { name: '100 trứng', value: 85, color: '#10b981' },
  { name: '200 trứng', value: 65, color: '#f59e0b' },
  { name: '500 trứng', value: 40, color: '#ef4444' },
  { name: '1000 trứng', value: 25, color: '#8b5cf6' },
];

const filterOptions = [
  { value: '1M', label: '1 Tháng' },
  { value: '3M', label: '3 Tháng' },
  { value: '6M', label: '6 Tháng' },
  { value: '9M', label: '9 Tháng' },
  { value: '12M', label: '1 Năm' },
];

const KPICard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color: string; 
  trend?: string;
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs text-slate-600 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {trend && (
          <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
            <TrendingUp size={12} />
            {trend}
          </p>
        )}
      </div>
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0 ml-2`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </div>
);

export function AdminDashboard() {
  const [timeFilter, setTimeFilter] = useState('6M');

  const getRevenueData = () => {
    switch(timeFilter) {
      case '1M': return revenueData1M;
      case '3M': return revenueData3M;
      case '6M': return revenueData6M;
      case '9M': return revenueData9M;
      case '12M': return revenueData12M;
      default: return revenueData6M;
    }
  };

  const getSuccessRateData = () => {
    switch(timeFilter) {
      case '1M': return successRateData1M;
      case '3M': return successRateData3M;
      case '6M': return successRateData6M;
      case '9M': return successRateData9M;
      case '12M': return successRateData12M;
      default: return successRateData6M;
    }
  };

  const getChartTitle = () => {
    const labels = {
      '1M': 'Doanh Thu 1 Tháng',
      '3M': 'Doanh Thu 3 Tháng',
      '6M': 'Doanh Thu 6 Tháng',
      '9M': 'Doanh Thu 9 Tháng',
      '12M': 'Doanh Thu 1 Năm',
    };
    return labels[timeFilter as keyof typeof labels];
  };

  const getSuccessRateTitle = () => {
    const labels = {
      '1M': 'Tỉ Lệ Ấp Nở Thành Công 1 Tháng (%)',
      '3M': 'Tỉ Lệ Ấp Nở Thành Công 3 Tháng (%)',
      '6M': 'Tỉ Lệ Ấp Nở Thành Công 6 Tháng (%)',
      '9M': 'Tỉ Lệ Ấp Nở Thành Công 9 Tháng (%)',
      '12M': 'Tỉ Lệ Ấp Nở Thành Công 1 Năm (%)',
    };
    return labels[timeFilter as keyof typeof labels];
  };

  return (
    <div className="space-y-4">
      {/* Time Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <Calendar size={18} />
            Khoảng thời gian:
          </div>
          <div className="flex gap-2 flex-wrap">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeFilter(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeFilter === option.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Tổng Máy Đã Bán"
          value="335"
          icon={Settings}
          color="bg-blue-500"
          trend="+12% tháng này"
        />
        <KPICard
          title="Tổng Doanh Thu"
          value="328M"
          icon={TrendingUp}
          color="bg-green-500"
          trend="+18% tháng này"
        />
        <KPICard
          title="User Hoạt Động"
          value="248"
          icon={Users}
          color="bg-purple-500"
          trend="+8% tháng này"
        />
        <KPICard
          title="Thiết Bị Lỗi"
          value="12"
          icon={AlertTriangle}
          color="bg-red-500"
        />
      </div>

      {/* AI Insight Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <span>🤖</span>
          AI Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-slate-700">
              ✅ 98.5% thiết bị online
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-amber-100">
            <p className="text-xs text-slate-700">
              ⚠️ 3 máy nhiệt độ bất thường
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-green-100">
            <p className="text-xs text-slate-700">
              📈 Tỉ lệ nở tăng 2.5%
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
            {getChartTitle()}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={getRevenueData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Doanh thu (VNĐ)"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Machine Type Distribution - Compact */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
            Phân Bổ Loại Máy
          </h3>
          <div className="space-y-2">
            {machineTypeData.map((item) => {
              const total = machineTypeData.reduce((sum, i) => sum + i.value, 0);
              const percentage = ((item.value / total) * 100).toFixed(0);
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-800">
                      {item.value}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div 
                      className="h-1.5 rounded-full transition-all"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Success Rate Chart - Moved to bottom row */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">
          {getSuccessRateTitle()}
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={getSuccessRateData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} domain={[80, 95]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px'
              }} 
            />
            <Bar 
              dataKey="rate" 
              fill="#10b981" 
              name="Tỉ lệ (%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}