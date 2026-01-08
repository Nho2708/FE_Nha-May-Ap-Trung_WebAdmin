import React, { useState } from 'react';
import { Package, ShoppingBag, Truck, CheckCircle, Clock, QrCode } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  capacity: string;
  stock: number;
  price: number;
}

interface Order {
  id: string;
  customer: string;
  product: string;
  status: 'deposit' | 'shipping' | 'completed';
  amount: number;
  date: string;
  qrCode: string;
}

const mockProducts: Product[] = [
  { id: 'P001', name: 'Máy ấp trứng 50', capacity: '50 trứng', stock: 45, price: 3500000 },
  { id: 'P002', name: 'Máy ấp trứng 100', capacity: '100 trứng', stock: 32, price: 5200000 },
  { id: 'P003', name: 'Máy ấp trứng 200', capacity: '200 trứng', stock: 28, price: 8500000 },
  { id: 'P004', name: 'Máy ấp trứng 500', capacity: '500 trứng', stock: 15, price: 18000000 },
  { id: 'P005', name: 'Máy ấp trứng 1000', capacity: '1000 trứng', stock: 8, price: 32000000 },
];

const mockOrders: Order[] = [
  {
    id: 'ORD-2024-001',
    customer: 'Nguyễn Văn A',
    product: 'Máy ấp trứng 100',
    status: 'completed',
    amount: 5200000,
    date: '2024-01-05',
    qrCode: 'INC-2024-100'
  },
  {
    id: 'ORD-2024-002',
    customer: 'Trần Thị B',
    product: 'Máy ấp trứng 200',
    status: 'shipping',
    amount: 8500000,
    date: '2024-01-07',
    qrCode: 'INC-2024-101'
  },
  {
    id: 'ORD-2024-003',
    customer: 'Lê Văn C',
    product: 'Máy ấp trứng 50',
    status: 'deposit',
    amount: 3500000,
    date: '2024-01-08',
    qrCode: 'INC-2024-102'
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    deposit: { label: 'Đặt cọc', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    shipping: { label: 'Đang giao', color: 'bg-blue-100 text-blue-800', icon: Truck },
    completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  };

  const { label, color, icon: Icon } = config[status as keyof typeof config];

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon size={12} />
      {label}
    </span>
  );
};

export function SalesOrders() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Quản Lý Bán Hàng</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Package size={18} />
          Tạo Đơn Hàng Mới
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 flex">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'products'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="inline-block mr-2" size={18} />
            Sản Phẩm
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'orders'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Package className="inline-block mr-2" size={18} />
            Đơn Hàng
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'products' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-5 border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800">{product.name}</h3>
                      <p className="text-sm text-slate-600">{product.capacity}</p>
                    </div>
                    <Package size={24} className="text-blue-600" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Tồn kho:</span>
                      <span className={`font-semibold ${product.stock < 20 ? 'text-red-600' : 'text-green-600'}`}>
                        {product.stock} máy
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Giá bán:</span>
                      <span className="font-semibold text-blue-600">
                        {product.price.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  </div>

                  <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Cập Nhật
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Mã Đơn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Khách Hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Sản Phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Trạng Thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Số Tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      QR Code
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {mockOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {order.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {order.product}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">
                        {order.amount.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm">
                          <QrCode size={14} />
                          {order.qrCode}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
