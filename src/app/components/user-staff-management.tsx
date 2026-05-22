import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Filter, Users, Loader2, RefreshCw } from "lucide-react";
import { Pagination } from "./pagination";
import { ResourceActionsMenu } from "./resource-actions-menu";
import { OptionalLabel, RequiredLabel, SidePanel } from "./side-panel";
import { can } from "@/config/permissions";
import { useSession } from "@/hooks/use-session";
import { userService } from "@/services/users";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserRole,
  UserStatus,
} from "@/types/user";
import { formatDate, formatEnumLabel } from "@/utils/format";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "ADMIN", label: "Quản trị viên" },
  { value: "TECHNICIAN", label: "Kỹ thuật viên" },
  { value: "SALES_STAFF", label: "Nhân viên kinh doanh" },
  { value: "CUSTOMER", label: "Khách hàng" },
];

const CREATABLE_ROLE_OPTIONS = ROLE_OPTIONS.filter((o) => o.value !== "ADMIN");

const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "DEACTIVE", label: "Ngưng hoạt động" },
];

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "bg-red-100 text-red-800";
    case "TECHNICIAN":
      return "bg-amber-100 text-amber-800";
    case "SALES_STAFF":
      return "bg-blue-100 text-blue-800";
    case "CUSTOMER":
      return "bg-green-100 text-green-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

const getStatusBadgeColor = (status: string) => {
  return status === "ACTIVE"
    ? "bg-green-100 text-green-800"
    : "bg-slate-100 text-slate-800";
};

const getRoleLabel = (role: string) =>
  ROLE_OPTIONS.find((option) => option.value === role)?.label || formatEnumLabel(role);

const getStatusLabel = (status: string) =>
  STATUS_OPTIONS.find((option) => option.value === status)?.label || formatEnumLabel(status);

export function UserStaffManagement() {
  const session = useSession();
  const role = session?.role;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await userService.list({
        role: roleFilter,
        status: statusFilter,
        page: 1,
        pageSize: 200,
      });
      setUsers(result.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const filteredUsers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.fullName.toLowerCase().includes(keyword) ||
        user.username.toLowerCase().includes(keyword) ||
        (user.email ?? "").toLowerCase().includes(keyword) ||
        user.phone.includes(searchTerm)
      );
    });
  }, [searchTerm, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleAddUser = async (payload: CreateUserPayload) => {
    setSubmitting(true);
    setError(null);

    try {
      await userService.create(payload);
      setIsAddModalOpen(false);
      await loadUsers();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể tạo người dùng.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (payload: UpdateUserPayload) => {
    if (!selectedUser) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await userService.update(selectedUser.id, payload);
      setIsEditModalOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể cập nhật người dùng.");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    total: users.length,
    admins: users.filter((user) => user.role === "ADMIN").length,
    staff: users.filter((user) => user.role === "TECHNICIAN" || user.role === "SALES_STAFF").length,
    active: users.filter((user) => user.status === "ACTIVE").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Quản Lý Người Dùng & Nhân Viên</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadUsers()}
            disabled={loading}
            className="px-3 py-1.5 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Tải lại
          </button>
          {can(role, "users", "create") && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus size={18} />
              Tạo Người Dùng
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-1">Tổng Người Dùng</div>
          <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-1">Quản Trị Viên</div>
          <div className="text-2xl font-bold text-red-600">{stats.admins}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-1">Nhân Viên</div>
          <div className="text-2xl font-bold text-blue-600">{stats.staff}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-1">Đang Hoạt Động</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 space-y-3">
        <div className="grid grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo tên, username, email, số điện thoại..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as UserRole | "all")}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất Cả Vai Trò</option>
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as UserStatus | "all")}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất Cả Trạng Thái</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <Loader2 size={28} className="mx-auto mb-3 animate-spin" />
            Đang tải danh sách người dùng...
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Họ Tên</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Số Điện Thoại</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Vai Trò</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Trạng Thái</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Tạo Lúc</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{user.fullName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{user.username}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{user.email || "--"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{user.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(user.status)}`}>
                        {getStatusLabel(user.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <ResourceActionsMenu
                        canEdit={can(role, "users", "edit")}
                        canDelete={can(role, "users", "delete")}
                        onEdit={() => {
                          setSelectedUser(user);
                          setIsEditModalOpen(true);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500">Không có người dùng phù hợp với bộ lọc</p>
              </div>
            )}

            <Pagination
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddUser}
        isSubmitting={submitting}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleEditUser}
        user={selectedUser}
        isSubmitting={submitting}
      />
    </div>
  );
}

function AddUserModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: CreateUserPayload) => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState<CreateUserPayload>({
    username: "",
    password: "",
    fullName: "",
    email: "",
    phone: "",
    role: "CUSTOMER",
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      ...formData,
      email: formData.email || undefined,
    });
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        username: "",
        password: "",
        fullName: "",
        email: "",
        phone: "",
        role: "CUSTOMER",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo Người Dùng"
      description="Điền thông tin tài khoản theo yêu cầu của hệ thống."
    >
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <FormField label={<RequiredLabel>Họ tên</RequiredLabel>}>
            <input
              type="text"
              value={formData.fullName}
              onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </FormField>
          <FormField label={<RequiredLabel>Tên đăng nhập</RequiredLabel>}>
            <input
              type="text"
              value={formData.username}
              onChange={(event) => setFormData({ ...formData, username: event.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </FormField>
          <FormField label={<RequiredLabel>Mật khẩu</RequiredLabel>}>
            <input
              type="password"
              value={formData.password}
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              minLength={6}
              required
            />
            <p className="mt-1 text-xs text-slate-500">Tối thiểu 6 ký tự theo API.</p>
          </FormField>
          <FormField label={<OptionalLabel>Email</OptionalLabel>}>
            <input
              type="email"
              value={formData.email ?? ""}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
          <FormField label={<RequiredLabel>Số điện thoại</RequiredLabel>}>
            <input
              type="tel"
              value={formData.phone}
              onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="mt-1 text-xs text-slate-500">Tối thiểu 9 ký tự theo API.</p>
          </FormField>
          <FormField label={<RequiredLabel>Vai trò</RequiredLabel>}>
            <select
              value={formData.role}
              onChange={(event) => setFormData({ ...formData, role: event.target.value as UserRole })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CREATABLE_ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
          <div className="flex gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? "Đang lưu..." : "Thêm"}
            </button>
          </div>
        </form>
    </SidePanel>
  );
}

function EditUserModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: UpdateUserPayload) => void;
  user: User | null;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState<UpdateUserPayload>({
    fullName: "",
    email: "",
    phone: "",
    role: "CUSTOMER",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email ?? "",
        phone: user.phone,
        role: user.role as UserRole,
        status: user.status as UserStatus,
      });
    }
  }, [user]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      ...formData,
      email: formData.email || undefined,
    });
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-t-2xl">
          <h2 className="text-lg font-bold">Chỉnh Sửa Người Dùng</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <FormField label="Họ Tên">
            <input
              type="text"
              value={formData.fullName ?? ""}
              onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              value={formData.email ?? ""}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
          <FormField label="Số Điện Thoại">
            <input
              type="tel"
              value={formData.phone ?? ""}
              onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </FormField>
          <FormField label="Vai Trò">
            <select
              value={formData.role}
              onChange={(event) => setFormData({ ...formData, role: event.target.value as UserRole })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CREATABLE_ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Trạng Thái">
            <select
              value={formData.status}
              onChange={(event) => setFormData({ ...formData, status: event.target.value as UserStatus })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
          <div className="flex gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? "Đang lưu..." : "Cập Nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      {typeof label === "string" ? (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      ) : (
        label
      )}
      {children}
    </div>
  );
}
