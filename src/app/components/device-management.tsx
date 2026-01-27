import React, { useState } from 'react';
import { Activity, AlertCircle, CheckCircle, QrCode, Thermometer } from 'lucide-react';
import { AddDeviceModal } from './add-device-modal';
import { Pagination } from './pagination';

interface Device {
  id: string;
  name: string;
  type: 'sensor' | 'fan' | 'heater' | 'motor' | 'other';
  incubatorId: string;
  status: 'working' | 'warning' | 'faulty';
  lastCalibrated: string;
  accuracy?: string;
  power?: string;
  location?: string;
}

const mockDevices: Device[] = [
  {
    id: 'SEN-2024-001',
    name: 'Cảm biến nhiệt độ chính',
    type: 'sensor',
    incubatorId: 'INC-001',
    status: 'working',
    lastCalibrated: '2024-01-15',
    accuracy: '±0.1°C',
    location: 'Tầng 1'
  },
  {
    id: 'SEN-2024-002',
    name: 'Cảm biến độ ẩm',
    type: 'sensor',
    incubatorId: 'INC-001',
    status: 'working',
    lastCalibrated: '2024-01-10',
    accuracy: '±2%',
    location: 'Tầng 2'
  },
  {
    id: 'FAN-2024-001',
    name: 'Quạt tuần hoàn gió',
    type: 'fan',
    incubatorId: 'INC-001',
    status: 'working',
    lastCalibrated: '2024-01-20',
    power: '50W',
    location: 'Phía trên'
  },
  {
    id: 'FAN-2024-002',
    name: 'Quạt tản nhiệt',
    type: 'fan',
    incubatorId: 'INC-002',
    status: 'warning',
    lastCalibrated: '2024-01-05',
    power: '60W',
    location: 'Phía sau'
  },
  {
    id: 'HET-2024-001',
    name: 'Phần tử gia nhiệt chính',
    type: 'heater',
    incubatorId: 'INC-001',
    status: 'working',
    lastCalibrated: '2024-01-18',
    power: '300W',
    location: 'Dưới đáy'
  },
  {
    id: 'HET-2024-002',
    name: 'Phần tử gia nhiệt phụ',
    type: 'heater',
    incubatorId: 'INC-002',
    status: 'faulty',
    lastCalibrated: '2023-12-20',
    power: '250W',
    location: 'Góc phải'
  },
  {
    id: 'MOT-2024-001',
    name: 'Động cơ đảo trứng',
    type: 'motor',
    incubatorId: 'INC-001',
    status: 'working',
    lastCalibrated: '2024-01-12',
    power: '45W',
    location: 'Khay trứng'
  },
  {
    id: 'MOT-2024-002',
    name: 'Động cơ cửa tự động',
    type: 'motor',
    incubatorId: 'INC-003',
    status: 'working',
    lastCalibrated: '2024-01-19',
    power: '30W',
    location: 'Cửa chính'
  },
  {
    id: 'SEN-2024-003',
    name: 'Cảm biến nhiệt độ dự phòng',
    type: 'sensor',
    incubatorId: 'INC-002',
    status: 'working',
    lastCalibrated: '2024-01-22',
    accuracy: '±0.15°C',
    location: 'Tầng 3'
  },
  {
    id: 'FAN-2024-003',
    name: 'Quạt khẩy khí',
    type: 'fan',
    incubatorId: 'INC-003',
    status: 'working',
    lastCalibrated: '2024-01-21',
    power: '40W',
    location: 'Phía trước'
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    working: { label: 'Hoạt động tốt', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    warning: { label: 'Cảnh báo', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
    faulty: { label: 'Hỏng hóc', color: 'bg-red-100 text-red-800', icon: Activity },
  };

  const { label, color, icon: Icon } = config[status as keyof typeof config];

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon size={12} />
      {label}
    </span>
  );
};

const DeviceTypeIcon = ({ type }: { type: string }) => {
  const icons: { [key: string]: React.ElementType } = {
    sensor: Thermometer,
    fan: Activity,
    heater: AlertCircle,
    motor: CheckCircle,
    other: CheckCircle,
  };
  const Icon = icons[type] || CheckCircle;
  return <Icon size={16} />;
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
        <h2 className="text-2xl font-bold text-slate-800">Quản Lý Thiết Bị Nội Bộ</h2>
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
                    Mã Thiết Bị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Tên Thiết Bị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Loại
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
                      selectedDevice?.id === device.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedDevice(device)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {device.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {device.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <DeviceTypeIcon type={device.type} />
                        <span className="capitalize">{device.type}</span>
                      </div>
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 font-semibold">Tên</span>
                    <span className="text-sm font-medium text-slate-900">
                      {selectedDevice.name}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 font-semibold">Loại Thiết Bị</span>
                    <div className="flex items-center gap-2">
                      <DeviceTypeIcon type={selectedDevice.type} />
                      <span className="text-sm font-medium capitalize text-slate-900">
                        {selectedDevice.type === 'sensor' && 'Cảm biến'}
                        {selectedDevice.type === 'fan' && 'Quạt'}
                        {selectedDevice.type === 'heater' && 'Máy gia nhiệt'}
                        {selectedDevice.type === 'motor' && 'Động cơ'}
                        {selectedDevice.type === 'other' && 'Khác'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 font-semibold">Máy Ấp Chứa</span>
                    <span className="text-sm font-medium text-slate-900">{selectedDevice.incubatorId}</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 font-semibold">Vị Trí</span>
                    <span className="text-sm font-medium text-slate-900">{selectedDevice.location}</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 font-semibold">Lần Cân Chỉnh</span>
                    <span className="text-sm font-medium text-slate-900">{selectedDevice.lastCalibrated}</span>
                  </div>
                </div>

                {selectedDevice.accuracy && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700 font-semibold">Độ Chính Xác</span>
                      <span className="text-sm font-medium text-slate-900">{selectedDevice.accuracy}</span>
                    </div>
                  </div>
                )}

                {selectedDevice.power && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700 font-semibold">Công Suất</span>
                      <span className="text-sm font-medium text-slate-900">{selectedDevice.power}</span>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 font-semibold">Trạng Thái</span>
                    <StatusBadge status={selectedDevice.status} />
                  </div>
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