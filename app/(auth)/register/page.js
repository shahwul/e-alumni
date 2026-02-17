"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [step, setStep] = useState(1); // 1: Form, 2: OTP
  const [form, setForm] = useState({ username: "", password: "", email: "", nama: "" });
  const [otp, setOtp] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(form),
    });
    if (res.ok) setStep(2);
    else alert("Gagal kirim OTP");
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email: form.email, otp }),
    });
    if (res.ok) {
      alert("Registrasi Berhasil! Silakan Login.");
      router.push("/login");
    } else alert("OTP Salah");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        {step === 1 ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <h1 className="text-2xl font-bold text-slate-800">Daftar Admin</h1>
            <input placeholder="Nama Lengkap" className="w-full p-3 border rounded-xl" onChange={(e)=>setForm({...form, nama: e.target.value})} />
            <input placeholder="Username" className="w-full p-3 border rounded-xl" onChange={(e)=>setForm({...form, username: e.target.value})} />
            <input placeholder="Email" type="email" className="w-full p-3 border rounded-xl" onChange={(e)=>setForm({...form, email: e.target.value})} />
            <input placeholder="Password" type="password" className="w-full p-3 border rounded-xl" onChange={(e)=>setForm({...form, password: e.target.value})} />
            <button className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold">Kirim OTP</button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4 text-center">
            <h1 className="text-2xl font-bold text-slate-800">Verifikasi OTP</h1>
            <p className="text-sm text-slate-500">Cek email: {form.email}</p>
            <input 
              placeholder="Masukkan 6 Digit OTP" 
              className="w-full p-3 border rounded-xl text-center tracking-widest text-xl font-bold" 
              onChange={(e) => setOtp(e.target.value)} 
            />
            <button className="w-full bg-green-600 text-white p-3 rounded-xl font-bold">Verifikasi</button>
          </form>
        )}
      </div>
    </div>
  );
}