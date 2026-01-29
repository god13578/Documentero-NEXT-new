'use client';

import { useState } from 'react';
import { loginAction } from './actions';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    const res = await loginAction(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-64 bg-blue-900 skew-y-3 origin-top-left translate-y-[-50%] z-0"></div>
      
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md z-10 border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-700" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">ระบบเอกสารราชการ</h1>
          <p className="text-slate-500 text-sm mt-1">Documentero NEXT</p>
        </div>

        <form action={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ใช้</label>
            <input
              name="username"
              type="text"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน</label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
               ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-700/20"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          ระบบสนับสนุนการปฏิบัติงานราชการ <br/> ปลอดภัยและรวดเร็ว
        </div>
      </div>
    </div>
  );
}
