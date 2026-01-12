import React, { useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  QrCode,
  Thermometer,
} from "lucide-react";
import { AddDeviceModal } from "./add-device-modal";
import { Pagination } from "../shared/pagination";

interface Device {
  id: string;
  model: string;
  owner: string;
  status: "running" | "warning" | "maintenance";
  temperature: number;
  humidity: number;
  fanSpeed: number;
  heaterStatus: boolean;
  motorCycle: string;
}

const mockDevices: Device[] = [
  {
    id: "INC-2024-001",
    model: "100 trứng",
    owner: "Nguyễn Văn A",
    status: "running",
    temperature: 37.5,
    humidity: 65,
    fanSpeed: 85,
    heaterStatus: true,
    motorCycle: "2h",
  },
  {
    id: "INC-2024-002",
    model: "200 trứng",
    owner: "Trần Thị B",
    status: "warning",
    temperature: 38.2,
    humidity: 58,
    fanSpeed: 92,
    heaterStatus: true,
    motorCycle: "2h",
  },
  {
    id: "INC-2024-003",
    model: "50 trứng",
    owner: "Lê Văn C",
    status: "running",
    temperature: 37.7,
    humidity: 63,
    fanSpeed: 88,
    heaterStatus: true,
    motorCycle: "2h",
  },
  {
    id: "INC-2024-004",
    model: "500 trứng",
    owner: "Phạm Thị D",
    status: "maintenance",
    temperature: 35.0,
    humidity: 45,
    fanSpeed: 0,
    heaterStatus: false,
    motorCycle: "Off",
  },
  {
    id: "INC-2024-005",
    model: "100 trứng",
    owner: "Hoàng Văn E",
    status: "running",
    temperature: 37.4,
    humidity: 64,
    fanSpeed: 86,
    heaterStatus: true,
    motorCycle: "2h",
  },
  {
    id: "INC-2024-006",
    model: "200 trứng",
    owner: "Vũ Thị F",
    status: "running",
    temperature: 37.6,
    humidity: 66,
    fanSpeed: 84,
    heaterStatus: true,
    motorCycle: "2h",
  },
  {
    id: "INC-2024-007",
    model: "50 trứng",
    owner: "Đặng Văn G",
    status: "warning",
    temperature: 38.5,
    humidity: 57,
    fanSpeed: 95,
    heaterStatus: true,
    motorCycle: "2h",
  },
  {
    id: "INC-2024-008",
    model: "100 trứng",
    owner: "Bùi Thị H",
    status: "running",
    temperature: 37.3,
    humidity: 65,
    fanSpeed: 87,
    heaterStatus: true,
    motorCycle: "2h",
  },
  {
    id: "INC-2024-009",
    model: "500 trứng",
    owner: "Ngô Văn I",
    status: "running",
    temperature: 37.8,
    humidity: 62,
    fanSpeed: 89,
    heaterStatus: true,
    motorCycle: "2h",
  },
  {
    id: "INC-2024-010",
    model: "200 trứng",
    owner: "Phan Thị J",
    status: "maintenance",
    temperature: 34.5,
    humidity: 42,
    fanSpeed: 0,
    heaterStatus: false,
    motorCycle: "Off",
  },
  {
    id: "INC-2024-011",
    model: "100 trứng",
    owner: "Trịnh Văn K",
    status: "running",
    temperature: 37.5,
    humidity: 64,
    fanSpeed: 85,
    heaterStatus: true,
    motorCycle: "2h",
  },
  {
    id: "INC-2024-012",
    model: "50 trứng",
    owner: "Lý Thị L",
    status: "warning",
    temperature: 38.0,
    humidity: 59,
    fanSpeed: 90,
    heaterStatus: true,
    motorCycle: "2h",
  },
  {
    id: "INC-2024-013",
    model: "200 trứng",
    owner: "Mai Văn M",
    status: "running",
    temperature: 37.6,
    humidity: 63,
    fanSpeed: 86,
    heaterStatus: true,
    motorCycle: "2h",
  },
  {
    id: "INC-2024-014",
    model: "100 trứng",
    owner: "Dương Thị N",
    status: "running",
    temperature: 37.4,
    humidity: 65,
    fanSpeed: 84,
    heaterStatus: true,
    motorCycle: "2h",
  },
  {
    id: "INC-2024-015",
    model: "500 trứng",
    owner: "Hà Văn O",
    status: "maintenance",
    temperature: 35.2,
    humidity: 46,
    fanSpeed: 0,
    heaterStatus: false,
    motorCycle: "Off",
  },
  {
    id: "INC-2024-016",
    model: "200 trứng",
    owner: "Cao Thị P",
    status: "running",
    temperature: 37.7,
    humidity: 64,
    fanSpeed: 87,
    heaterStatus: true,
    motorCycle: "2h",
  },
  {
    id: "INC-2024-017",
    model: "100 trứng",
    owner: "Tô Văn Q",
    status: "warning",
    temperature: 38.3,
    humidity: 58,
    fanSpeed: 93,
    heaterStatus: true,
    motorCycle: "2h",
  },
  {
    id: "INC-2024-018",
    model: "50 trứng",
    owner: "Đinh Thị R",
    status: "running",
    temperature: 37.5,
    humidity: 65,
    fanSpeed: 85,
    heaterStatus: true,
    motorCycle: "2h",
  },
  {
    id: "INC-2024-019",
    model: "200 trứng",
    owner: "Lâm Văn S",
    status: "running",
    temperature: 37.6,
    humidity: 63,
    fanSpeed: 86,
    heaterStatus: true,
    motorCycle: "2h",
  },
  {
    id: "INC-2024-020",
    model: "100 trứng",
    owner: "Ông Thị T",
    status: "running",
    temperature: 37.4,
    humidity: 64,
    fanSpeed: 84,
    heaterStatus: true,
    motorCycle: "2h",
  },
  {
    id: "INC-2024-021",
    model: "500 trứng",
    owner: "Võ Văn U",
    status: "warning",
    temperature: 38.1,
    humidity: 60,
    fanSpeed: 91,
    heaterStatus: true,
    motorCycle: "2h",
  },
  {
    id: "INC-2024-022",
    model: "200 trứng",
    owner: "Từ Thị V",
    status: "running",
    temperature: 37.5,
    humidity: 65,
    fanSpeed: 85,
    heaterStatus: true,
    motorCycle: "2h",
  },
  {
    id: "INC-2024-023",
    model: "100 trứng",
    owner: "Khương Văn W",
    status: "maintenance",
    temperature: 34.8,
    humidity: 44,
    fanSpeed: 0,
    heaterStatus: false,
    motorCycle: "Off",
  },
  {
    id: "INC-2024-024",
    model: "50 trứng",
    owner: "La Thị X",
    status: "running",
    temperature: 37.6,
    humidity: 64,
    fanSpeed: 86,
    heaterStatus: true,
    motorCycle: "2h",
  },
  {
    id: "INC-2024-025",
    model: "200 trứng",
    owner: "Thạch Văn Y",
    status: "running",
    temperature: 37.7,
    humidity: 63,
    fanSpeed: 87,
    heaterStatus: true,
    motorCycle: "2h",
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    running: {
      label: "Hoạt động",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    warning: {
      label: "Cảnh báo",
      color: "bg-yellow-100 text-yellow-800",
      icon: AlertCircle,
    },
    maintenance: {
      label: "Bảo trì",
      color: "bg-red-100 text-red-800",
      icon: Activity,
    },
  };

  const { label, color, icon: Icon } = config[status as keyof typeof config];

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${color}`}
    >
      <Icon size={12} />
      {label}
    </span>
  );
};

export function DeviceManagement() {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleAddDevice = (newDevice: Device) => {
    setDevices([...devices, newDevice]);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = devices.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Quản Lý Thiết Bị</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Lọc
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thêm Thiết Bị
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Mã Máy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Dòng Máy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Chủ Sở Hữu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Trạng Thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentItems.map((device) => (
                  <tr
                    key={device.id}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      selectedDevice?.id === device.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedDevice(device)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {device.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {device.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {device.owner}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={device.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            totalItems={devices.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            totalPages={Math.ceil(devices.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Device Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {selectedDevice ? (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Chi Tiết Thiết Bị
                </h3>
                <p className="text-sm text-slate-600">{selectedDevice.id}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-700 flex items-center gap-2">
                      <Thermometer size={16} />
                      Nhiệt độ
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {selectedDevice.temperature}°C
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(selectedDevice.temperature / 40) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-700">Độ ẩm</span>
                    <span className="text-2xl font-bold text-green-600">
                      {selectedDevice.humidity}%
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${selectedDevice.humidity}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Tốc độ quạt</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {selectedDevice.fanSpeed}%
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Máy gia nhiệt</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {selectedDevice.heaterStatus ? "ON" : "OFF"}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-600 mb-1">
                    Chu kỳ đảo trứng
                  </p>
                  <p className="text-lg font-semibold text-slate-800">
                    {selectedDevice.motorCycle}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                  <QrCode size={80} className="mx-auto mb-2 text-purple-600" />
                  <p className="text-xs text-slate-700">QR Code Thiết Bị</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedDevice.id}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Chọn thiết bị để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Device Modal */}
      <AddDeviceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddDevice}
      />
    </div>
  );
}
