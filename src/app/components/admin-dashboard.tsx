import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Settings, 
  AlertTriangle 
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

const revenueData = [
  { month: 'T1', revenue: 45000000 },
  { month: 'T2', revenue: 52000000 },
  { month: 'T3', revenue: 48000000 },
  { month: 'T4', revenue: 61000000 },
  { month: 'T5', revenue: 55000000 },
  { month: 'T6', revenue: 67000000 },
];

const successRateData = [
  { month: 'T1', rate: 85 },
  { month: 'T2', rate: 88 },
  { month: 'T3', rate: 90 },
  { month: 'T4', rate: 87 },
  { month: 'T5', rate: 92 },
  { month: 'T6', rate: 91 },
];

const machineTypeData = [
  { name: '50 trứng', value: 120, color: '#3b82f6' },
  { name: '100 trứng', value: 85, color: '#10b981' },
  { name: '200 trứng', value: 65, color: '#f59e0b' },
  { name: '500 trứng', value: 40, color: '#ef4444' },
  { name: '1000 trứng', value: 25, color: '#8b5cf6' },
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
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-600 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        {trend && (
          <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
            <TrendingUp size={14} />
            {trend}
          </p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span>🤖</span>
          AI Summary Today
        </h3>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-slate-700">
              ✅ Hệ thống đang hoạt động ổn định với 98.5% thiết bị online
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-amber-100">
            <p className="text-sm text-slate-700">
              ⚠️ Phát hiện 3 máy có nhiệt độ dao động bất thường tại khu vực miền Trung
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <p className="text-sm text-slate-700">
              📈 Tỉ lệ ấp nở thành công tăng 2.5% so với tháng trước
            </p>
          </div>
        </div>
        <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Ask AI
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Doanh Thu Theo Thời Gian
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Doanh thu (VNĐ)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Success Rate Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Tỉ Lệ Ấp Nở Thành Công
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={successRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Bar 
                dataKey="rate" 
                fill="#10b981" 
                name="Tỉ lệ (%)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Machine Type Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Loại Máy Được Sử Dụng
        </h3>
        <div className="flex items-center justify-between">
          <ResponsiveContainer width="50%" height={300}>
            <PieChart>
              <Pie
                data={machineTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {machineTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="space-y-3 flex-1">
            {machineTypeData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-slate-700">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-slate-800">
                  {item.value} máy
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
