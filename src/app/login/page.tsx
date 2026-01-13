"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState(false);

  async function onSubmit(formData: FormData) {
    const result = await loginAction(formData);

    if (result?.ok) {
      router.replace("/");
    } else {
      setError(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        action={onSubmit}
        className="bg-white p-6 rounded w-80 shadow"
      >
        <h1 className="text-xl font-semibold mb-4">เข้าสู่ระบบ</h1>

        <input
          name="username"
          placeholder="ชื่อผู้ใช้"
          className="border p-2 w-full mb-3"
        />

        <input
          type="password"
          name="password"
          placeholder="รหัสผ่าน"
          className="border p-2 w-full mb-3"
        />

        {error && (
          <p className="text-red-600 text-sm mb-2">
            ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
          </p>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2"
        >
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  );
}
