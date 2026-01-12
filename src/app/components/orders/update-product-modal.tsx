import React, { useState, useEffect } from 'react';
import { X, Package, Warehouse, DollarSign } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  capacity: string;
  stock: number;
  price: number;
}

interface UpdateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Product) => void;
  product: Product | null;
}

export function UpdateProductModal({ isOpen, onClose, onSubmit, product }: UpdateProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    stock: 0,
    price: 0,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        capacity: product.capacity,
        stock: product.stock,
        price: product.price,
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    onSubmit({
      ...product,
      ...formData,
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'stock' || name === 'price' ? Number(value) : value
    });
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white p-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Cập Nhật Sản Phẩm</h2>
              <p className="text-cyan-100 text-sm mt-1">Mã sản phẩm: {product.id}</p>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Product Info */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Thông Tin Sản Phẩm</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-600">Mã sản phẩm:</span>
                <p className="font-medium text-slate-800">{product.id}</p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Tên Sản Phẩm <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Máy ấp trứng 100"
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Công Suất <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="Ví dụ: 100 trứng"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          {/* Grid for Stock and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Tồn Kho <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Số lượng máy trong kho</p>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Giá Bán (₫) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="100000"
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Giá bán của sản phẩm</p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-lg p-3 border border-cyan-200">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-600">Tồn kho:</p>
                <p className={`font-semibold ${formData.stock < 20 ? 'text-red-600' : 'text-green-600'}`}>
                  {formData.stock} máy
                </p>
              </div>
              <div>
                <p className="text-slate-600">Giá bán:</p>
                <p className="font-semibold text-cyan-600">
                  {formData.price.toLocaleString('vi-VN')} ₫
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-colors font-medium shadow-lg flex items-center justify-center gap-2"
            >
              <Package size={16} />
              Lưu Thay Đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
