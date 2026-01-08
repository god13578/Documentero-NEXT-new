"use client";

import { useFormState } from "react-dom";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, action] = useFormState(loginAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        action={action}
        className="bg-white p-6 rounded w-80 shadow"
      >
        <h1 className="text-xl font-semibold mb-4">
          เข้าสู่ระบบ
        </h1>

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

        {state?.error && (
          <p className="text-red-600 text-sm mb-2">
            {state.error}
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
