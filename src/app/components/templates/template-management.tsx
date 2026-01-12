import React, { useState } from "react";
import {
  FileText,
  Thermometer,
  Droplet,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import { CreateTemplateModal } from "./create-template-modal";
import { UpdateTemplateModal } from "./update-template-modal";

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
    id: "T001",
    name: "Trứng Gà",
    icon: "🐔",
    temperature: "37.5-38°C",
    humidity: "55-65%",
    duration: "21 ngày",
    turnCycle: "2 giờ",
    users: 156,
    sessions: 324,
    successRate: 92,
  },
  {
    id: "T002",
    name: "Trứng Vịt",
    icon: "🦆",
    temperature: "37-37.5°C",
    humidity: "58-62%",
    duration: "28 ngày",
    turnCycle: "2 giờ",
    users: 89,
    sessions: 178,
    successRate: 88,
  },
  {
    id: "T003",
    name: "Trứng Ngỗng",
    icon: "🦢",
    temperature: "37.5-38°C",
    humidity: "60-65%",
    duration: "28-30 ngày",
    turnCycle: "3 giờ",
    users: 42,
    sessions: 95,
    successRate: 85,
  },
  {
    id: "T004",
    name: "Trứng Chim",
    icon: "🐦",
    temperature: "37-37.5°C",
    humidity: "50-55%",
    duration: "14-18 ngày",
    turnCycle: "1.5 giờ",
    users: 28,
    sessions: 67,
    successRate: 78,
  },
  {
    id: "T005",
    name: "Trứng Đà Điểu",
    icon: "🦤",
    temperature: "36-36.5°C",
    humidity: "25-30%",
    duration: "42-45 ngày",
    turnCycle: "4 giờ",
    users: 15,
    sessions: 32,
    successRate: 80,
  },
];

export function TemplateManagement() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] =
    useState(false);
  const [isUpdateTemplateModalOpen, setIsUpdateTemplateModalOpen] =
    useState(false);
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);

  const handleCreateTemplate = (newTemplate: Template) => {
    setTemplates([...templates, newTemplate]);
  };

  const handleUpdateTemplate = (updatedTemplate: Template) => {
    setTemplates(
      templates.map((template) =>
        template.id === updatedTemplate.id ? updatedTemplate : template
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">
          Quản Lý Template Ấp Trứng
        </h2>
        <button
          onClick={() => setIsCreateTemplateModalOpen(true)}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FileText size={16} />
          Tạo Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Template List */}
        <div className="lg:col-span-2 space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer hover:shadow ${
                selectedTemplate?.id === template.id
                  ? "border-blue-500 shadow"
                  : "border-slate-200"
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{template.icon}</span>
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">
                        {template.name}
                      </h3>
                      <p className="text-xs text-slate-600">{template.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-600 mb-0.5">
                      <TrendingUp size={14} />
                      <span className="text-base font-bold">
                        {template.successRate}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">Thành công</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Thermometer size={12} className="text-red-600" />
                      <span className="text-xs text-slate-700">Nhiệt độ</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      {template.temperature}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Droplet size={12} className="text-blue-600" />
                      <span className="text-xs text-slate-700">Độ ẩm</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      {template.humidity}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Clock size={12} className="text-purple-600" />
                      <span className="text-xs text-slate-700">Thời gian</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      {template.duration}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Clock size={12} className="text-green-600" />
                      <span className="text-xs text-slate-700">Đảo trứng</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      {template.turnCycle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Users size={14} />
                    <span>{template.users} người dùng</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText size={14} />
                    <span>{template.sessions} vụ ấp</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Template Details */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 h-fit sticky top-6">
          {selectedTemplate ? (
            <div className="space-y-4">
              <div className="text-center pb-3 border-b border-slate-200">
                <span className="text-5xl mb-2 block">
                  {selectedTemplate.icon}
                </span>
                <h3 className="text-base font-semibold text-slate-800">
                  {selectedTemplate.name}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  ID: {selectedTemplate.id}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 mb-2">
                    Thông Số Kỹ Thuật
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded text-xs">
                      <span className="text-slate-600">Nhiệt độ:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedTemplate.temperature}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded text-xs">
                      <span className="text-slate-600">Độ ẩm:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedTemplate.humidity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded text-xs">
                      <span className="text-slate-600">Thời gian ấp:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedTemplate.duration}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded text-xs">
                      <span className="text-slate-600">Chu kỳ đảo:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedTemplate.turnCycle}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-700 mb-2">
                    Thống Kê Sử Dụng
                  </h4>
                  <div className="space-y-2">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-2.5">
                      <p className="text-xs text-slate-700 mb-0.5">
                        Người dùng
                      </p>
                      <p className="text-xl font-bold text-blue-600">
                        {selectedTemplate.users}
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-2.5">
                      <p className="text-xs text-slate-700 mb-0.5">Số vụ ấp</p>
                      <p className="text-xl font-bold text-purple-600">
                        {selectedTemplate.sessions}
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-2.5">
                      <p className="text-xs text-slate-700 mb-0.5">
                        Tỉ lệ thành công
                      </p>
                      <p className="text-xl font-bold text-green-600">
                        {selectedTemplate.successRate}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 space-y-2">
                  <button
                    onClick={() => {
                      setIsUpdateTemplateModalOpen(true);
                    }}
                    className="w-full px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Chỉnh Sửa
                  </button>
                  <button className="w-full px-3 py-1.5 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors">
                    Sao Chép
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">
                Chọn template để xem chi tiết
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={isCreateTemplateModalOpen}
        onClose={() => setIsCreateTemplateModalOpen(false)}
        onSubmit={handleCreateTemplate}
      />

      {/* Update Template Modal */}
      <UpdateTemplateModal
        isOpen={isUpdateTemplateModalOpen}
        onClose={() => setIsUpdateTemplateModalOpen(false)}
        onSubmit={handleUpdateTemplate}
        template={selectedTemplate}
      />
    </div>
  );
}
