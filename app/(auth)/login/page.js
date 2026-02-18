"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/ptk");
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Gagal koneksi ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Login Superadmin</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Username</label>
            <input
              type="text"
              className="w-full mt-1 p-3 border rounded-xl outline-blue-500"
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              className="w-full mt-1 p-3 border rounded-xl outline-blue-500"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-400"
          >
            {loading ? "Loading..." : "Masuk Sekarang"}
          </button>
        </form>
      </div>
    </div>
  );
}