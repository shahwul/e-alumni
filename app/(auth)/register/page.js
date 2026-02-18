"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignupForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const router = useRouter();

  const handleRequestOtp = async (data) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      
      if (res.ok) {
        setFormData(data);
        setStep(2);
      } else {
        alert(result.message || "Gagal mengirim kode verifikasi.");
      }
    } catch (err) {
      alert("Terjadi kesalahan server.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: otpValue }),
      });

      if (res.ok) {
        alert("Registrasi Berhasil! Silakan Login.");
        router.push("/login");
      } else {
        alert("Kode OTP salah atau sudah kedaluwarsa.");
      }
    } catch (err) {
      alert("Gagal melakukan verifikasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 py-10">
      <div className="w-full max-w-sm overflow-hidden rounded-[26px] bg-white shadow-lg">
        <div className="flex flex-col gap-4 p-8">
          
          {/* Header Logo & Title */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <img src="favicon.ico" alt="Logo" className="size-12" />
            <h1 className="text-xl font-bold">E-Alumni BBGTK DIY</h1>
          </div>

          <hr className="border-gray-100 mb-4" />

          {step === 1 ? (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <p className="text-sm text-slate-500">Silakan lengkapi data diri Anda</p>
              </div>
              <SignupForm onComplete={handleRequestOtp} isLoading={loading} />
            </div>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold">Verifikasi Email</h2>
                <p className="text-sm text-slate-500">
                  Kode OTP telah dikirim ke <br />
                  <span className="font-medium text-slate-900">{formData?.email}</span>
                </p>
              </div>

              <input
                type="text"
                className="w-full p-4 border rounded-2xl text-center text-3xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                maxLength={6}
                placeholder="000000"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, ""))}
                required
              />

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || otpValue.length < 6}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white p-4 rounded-2xl font-bold transition-colors"
                >
                  {loading ? "Memproses..." : "Verifikasi Sekarang"}
                </button>
                
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                >
                  ← Kembali ke pendaftaran
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}