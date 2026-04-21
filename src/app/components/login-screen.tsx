import React, { useState } from "react";
import { Loader2, Lock, User2 } from "lucide-react";
import { env } from "@/config/env";
import { authService, authStorage } from "@/services/auth";

export function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = await authService.login(username.trim(), password);
      authStorage.setAccessToken(token);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Đăng nhập thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_30%),linear-gradient(135deg,#eff6ff_0%,#f8fafc_45%,#e2e8f0_100%)] flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1.1fr_0.9fr] overflow-hidden rounded-3xl shadow-2xl border border-white/60 bg-white/85 backdrop-blur">
        <div className="hidden lg:flex flex-col justify-between p-10 bg-slate-900 text-white">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-200">IncuSmart</p>
            <h1 className="mt-6 text-4xl font-bold leading-tight">
              Web Admin cho hệ thống máy ấp trứng và vận hành hậu mãi.
            </h1>
            <p className="mt-4 text-slate-300 text-base leading-7">
              Tập trung quản lý người dùng, bảo trì thiết bị và theo dõi vận hành trên một giao diện thống nhất.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Tài khoản" value="Bảo mật" />
            <StatCard label="Nhân sự" value="Quản lý" />
            <StatCard label="Bảo trì" value="Theo dõi" />
          </div>
        </div>

        <div className="p-8 lg:p-10">
          <div className="max-w-md mx-auto">
            <div className="lg:hidden mb-8">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-600">IncuSmart</p>
              <h1 className="mt-3 text-3xl font-bold text-slate-900">{env.appName}</h1>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Đăng nhập</h2>
              <p className="mt-2 text-sm text-slate-600">
                Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập để tiếp tục.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <FormField label="Username">
                <div className="relative">
                  <User2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="Nhập tên đăng nhập"
                    maxLength={15}
                    required
                  />
                </div>
              </FormField>

              <FormField label="Password">
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="Nhập mật khẩu"
                    maxLength={20}
                    required
                  />
                </div>
              </FormField>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập vào hệ thống"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
