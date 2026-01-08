import React, { useState } from 'react';
import { FileText, Thermometer, Droplet, Clock, TrendingUp, Users } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  icon: string;
  temperature: string;
  humidity: string;
  duration: string;
  turnCycle: string;
  users: number;
  sessions: number;
  successRate: number;
}

const mockTemplates: Template[] = [
  {
    id: 'T001',
    name: 'Trứng Gà',
    icon: '🐔',
    temperature: '37.5-38°C',
    humidity: '55-65%',
    duration: '21 ngày',
    turnCycle: '2 giờ',
    users: 156,
    sessions: 324,
    successRate: 92
  },
  {
    id: 'T002',
    name: 'Trứng Vịt',
    icon: '🦆',
    temperature: '37-37.5°C',
    humidity: '58-62%',
    duration: '28 ngày',
    turnCycle: '2 giờ',
    users: 89,
    sessions: 178,
    successRate: 88
  },
  {
    id: 'T003',
    name: 'Trứng Ngỗng',
    icon: '🦢',
    temperature: '37.5-38°C',
    humidity: '60-65%',
    duration: '28-30 ngày',
    turnCycle: '3 giờ',
    users: 42,
    sessions: 95,
    successRate: 85
  },
  {
    id: 'T004',
    name: 'Trứng Chim',
    icon: '🐦',
    temperature: '37-37.5°C',
    humidity: '50-55%',
    duration: '14-18 ngày',
    turnCycle: '1.5 giờ',
    users: 28,
    sessions: 67,
    successRate: 78
  },
  {
    id: 'T005',
    name: 'Trứng Đà Điểu',
    icon: '🦤',
    temperature: '36-36.5°C',
    humidity: '25-30%',
    duration: '42-45 ngày',
    turnCycle: '4 giờ',
    users: 15,
    sessions: 32,
    successRate: 80
  },
];

export function TemplateManagement() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Quản Lý Template Ấp Trứng</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <FileText size={18} />
          Tạo Template Mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="lg:col-span-2 space-y-4">
          {mockTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`bg-white rounded-xl shadow-sm border-2 transition-all cursor-pointer hover:shadow-md ${
                selectedTemplate?.id === template.id
                  ? 'border-blue-500 shadow-md'
                  : 'border-slate-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{template.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        {template.name}
                      </h3>
                      <p className="text-sm text-slate-600">ID: {template.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-600 mb-1">
                      <TrendingUp size={16} />
                      <span className="text-lg font-bold">{template.successRate}%</span>
                    </div>
                    <p className="text-xs text-slate-600">Tỉ lệ thành công</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Thermometer size={14} className="text-red-600" />
                      <span className="text-xs text-slate-700">Nhiệt độ</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      {template.temperature}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Droplet size={14} className="text-blue-600" />
                      <span className="text-xs text-slate-700">Độ ẩm</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      {template.humidity}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={14} className="text-purple-600" />
                      <span className="text-xs text-slate-700">Thời gian</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      {template.duration}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={14} className="text-green-600" />
                      <span className="text-xs text-slate-700">Đảo trứng</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      {template.turnCycle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>{template.users} người dùng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    <span>{template.sessions} vụ ấp</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Template Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit sticky top-6">
          {selectedTemplate ? (
            <div className="space-y-6">
              <div className="text-center pb-4 border-b border-slate-200">
                <span className="text-6xl mb-3 block">{selectedTemplate.icon}</span>
                <h3 className="text-xl font-semibold text-slate-800">
                  {selectedTemplate.name}
                </h3>
                <p className="text-sm text-slate-600 mt-1">Template ID: {selectedTemplate.id}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">
                    Thông Số Kỹ Thuật
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm text-slate-600">Nhiệt độ:</span>
                      <span className="text-sm font-semibold text-slate-800">
                        {selectedTemplate.temperature}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm text-slate-600">Độ ẩm:</span>
                      <span className="text-sm font-semibold text-slate-800">
                        {selectedTemplate.humidity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm text-slate-600">Thời gian ấp:</span>
                      <span className="text-sm font-semibold text-slate-800">
                        {selectedTemplate.duration}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm text-slate-600">Chu kỳ đảo:</span>
                      <span className="text-sm font-semibold text-slate-800">
                        {selectedTemplate.turnCycle}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">
                    Thống Kê Sử Dụng
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3">
                      <p className="text-xs text-slate-700 mb-1">Người dùng</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedTemplate.users}
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3">
                      <p className="text-xs text-slate-700 mb-1">Số vụ ấp</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {selectedTemplate.sessions}
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3">
                      <p className="text-xs text-slate-700 mb-1">Tỉ lệ thành công</p>
                      <p className="text-2xl font-bold text-green-600">
                        {selectedTemplate.successRate}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Chỉnh Sửa Template
                  </button>
                  <button className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                    Sao Chép Template
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Chọn template để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
