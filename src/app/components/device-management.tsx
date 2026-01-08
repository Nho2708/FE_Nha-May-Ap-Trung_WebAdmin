import React, { useState } from 'react';
import { Activity, AlertCircle, CheckCircle, QrCode, Thermometer } from 'lucide-react';

interface Device {
  id: string;
  model: string;
  owner: string;
  status: 'running' | 'warning' | 'maintenance';
  temperature: number;
  humidity: number;
  fanSpeed: number;
  heaterStatus: boolean;
  motorCycle: string;
}

const mockDevices: Device[] = [
  {
    id: 'INC-2024-001',
    model: '100 trứng',
    owner: 'Nguyễn Văn A',
    status: 'running',
    temperature: 37.5,
    humidity: 65,
    fanSpeed: 85,
    heaterStatus: true,
    motorCycle: '2h'
  },
  {
    id: 'INC-2024-002',
    model: '200 trứng',
    owner: 'Trần Thị B',
    status: 'warning',
    temperature: 38.2,
    humidity: 58,
    fanSpeed: 92,
    heaterStatus: true,
    motorCycle: '2h'
  },
  {
    id: 'INC-2024-003',
    model: '50 trứng',
    owner: 'Lê Văn C',
    status: 'running',
    temperature: 37.7,
    humidity: 63,
    fanSpeed: 88,
    heaterStatus: true,
    motorCycle: '2h'
  },
  {
    id: 'INC-2024-004',
    model: '500 trứng',
    owner: 'Phạm Thị D',
    status: 'maintenance',
    temperature: 35.0,
    humidity: 45,
    fanSpeed: 0,
    heaterStatus: false,
    motorCycle: 'Off'
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    running: { label: 'Hoạt động', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    warning: { label: 'Cảnh báo', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
    maintenance: { label: 'Bảo trì', color: 'bg-red-100 text-red-800', icon: Activity },
  };

  const { label, color, icon: Icon } = config[status as keyof typeof config];

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon size={12} />
      {label}
    </span>
  );
};

export function DeviceManagement() {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Quản Lý Thiết Bị</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Lọc
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                {mockDevices.map((device) => (
                  <tr
                    key={device.id}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      selectedDevice?.id === device.id ? 'bg-blue-50' : ''
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
                      style={{ width: `${(selectedDevice.temperature / 40) * 100}%` }}
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
                      {selectedDevice.heaterStatus ? 'ON' : 'OFF'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-600 mb-1">Chu kỳ đảo trứng</p>
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
    </div>
  );
}
