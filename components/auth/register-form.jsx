"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { 
  User, Mail, Eye, EyeOff, X, Check, 
  CircleAlert, IdCardLanyard, Loader2 
} from "lucide-react";

export function SignupForm({ className, ...props }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ username: "", password: "", email: "", nama: "" });
  const [otp, setOtp] = useState("");
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState({ username: false, email: false });

  const [passwordNotSynchronize, setPasswordNotSynchronize] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const validations = [
    { text: "Minimal 8 karakter", valid: form.password.length >= 8 },
    { text: "Huruf besar", valid: /[A-Z]/.test(form.password) },
    { text: "Huruf kecil", valid: /[a-z]/.test(form.password) },
    { text: "Angka (0-9)", valid: /[0-9]/.test(form.password) },
    { text: "Simbol (!@#$%^&*)", valid: /[!@#$%^&*]/.test(form.password) },
  ];

  const allValid = validations.every(v => v.valid);

  useEffect(() => {
    if (!form.username) {
      setUsernameError("");
      return;
    }
    const delayDebounce = setTimeout(() => {
      checkAvailability("username", form.username);
    }, 600);
    return () => clearTimeout(delayDebounce);
  }, [form.username]);

  useEffect(() => {
    if (!form.email) {
      setEmailError("");
      return;
    }
    const delayDebounce = setTimeout(() => {
      checkAvailability("email", form.email);
    }, 600);
    return () => clearTimeout(delayDebounce);
  }, [form.email]);

  const checkAvailability = async (field, value) => {
    setIsChecking(prev => ({ ...prev, [field]: true }));
    try {
      const res = await fetch(`/api/auth/register?${field}=${value}`);
      const data = await res.json();
      if (field === "username") setUsernameError(data.available ? "" : data.message);
      if (field === "email") setEmailError(data.available ? "" : data.message);
    } catch (err) {
      console.error("Gagal cek data server");
    } finally {
      setIsChecking(prev => ({ ...prev, [field]: false }));
    }
  };

  // --- HANDLERS ---
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!allValid || passwordNotSynchronize || usernameError || emailError) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setStep(2);
      else {
        const data = await res.json();
        alert(data.message || "Gagal kirim OTP");
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });
      if (res.ok) {
        alert("Registrasi Berhasil! Silakan Login.");
        router.push("/login");
      } else alert("Kode OTP salah atau kedaluwarsa");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      {step === 1 ? (
        <form onSubmit={handleRegister}>
          <FieldGroup className="flex flex-col gap-3 max-w-xs mx-auto">
            <div className="flex flex-col gap-1 text-center mb-2">
              <h1 className="text-xl font-bold">Daftar Akun Baru</h1>
              <p className="text-muted-foreground text-xs">
                Lengkapi data di bawah untuk bergabung
              </p>
            </div>

            {/* Nama Lengkap */}
            <Field>
              <div className="relative">
                <Input
                  placeholder="Nama Lengkap"
                  className="pr-12 text-sm"
                  required
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                />
                <div className="absolute inset-y-0 right-0 flex items-center justify-center w-10 bg-slate-50 border-l border-input rounded-r-md">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </Field>

            {/* Username */}
            <Field className="space-y-1">
              <div className="relative">
                <Input
                  placeholder="Username"
                  className={`pr-12 text-sm ${usernameError ? "border-red-500 ring-red-50" : ""}`}
                  required
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
                <div className="absolute inset-y-0 right-0 flex items-center justify-center w-10 bg-slate-50 border-l border-input rounded-r-md">
                  {isChecking.username ? (
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                  ) : (
                    <IdCardLanyard className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </div>
              {usernameError && (
                <div className="flex items-center gap-1 px-1 animate-in fade-in slide-in-from-top-1">
                  <CircleAlert className="w-3 h-3 text-red-600" />
                  <span className="text-[10px] text-red-600 font-medium">{usernameError}</span>
                </div>
              )}
            </Field>

            {/* Email */}
            <Field className="space-y-1">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Email"
                  className={`pr-12 text-sm ${emailError ? "border-red-500 ring-red-50" : ""}`}
                  required
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <div className="absolute inset-y-0 right-0 flex items-center justify-center w-10 bg-slate-50 border-l border-input rounded-r-md">
                  {isChecking.email ? (
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                  ) : (
                    <Mail className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </div>
              {emailError && (
                <div className="flex items-center gap-1 px-1 animate-in fade-in slide-in-from-top-1">
                  <CircleAlert className="w-3 h-3 text-red-600" />
                  <span className="text-[10px] text-red-600 font-medium">{emailError}</span>
                </div>
              )}
            </Field>

            {/* Password */}
            <Field>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="pr-12 text-sm"
                  required
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-10 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                </button>
              </div>
            </Field>

            {/* Confirm Password */}
            <Field className="space-y-1">
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Ulangi Password"
                  className={`pr-12 text-sm ${passwordNotSynchronize ? "border-red-500 ring-red-50" : ""}`}
                  required
                  onChange={(e) => setPasswordNotSynchronize(e.target.value !== form.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-10 hover:text-indigo-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                </button>
              </div>
              {passwordNotSynchronize && (
                <div className="flex items-center gap-1 px-1 animate-in fade-in slide-in-from-top-1">
                  <CircleAlert className="w-3 h-3 text-red-600" />
                  <span className="text-[10px] text-red-600 font-medium">Password tidak sinkron</span>
                </div>
              )}
            </Field>

            {/* Validation Checkbox Grid */}
            <div className="grid grid-cols-2 gap-y-1 mt-1 px-1">
              {validations.map((v, i) => (
                <div key={i} className={`flex items-center gap-1.5 text-[10px] transition-colors ${v.valid ? "text-green-600 font-medium" : "text-slate-400"}`}>
                  {v.valid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>{v.text}</span>
                </div>
              ))}
            </div>

            <Button 
              type="submit" 
              className="mt-3 w-full font-bold h-11 text-sm bg-blue-600 hover:bg-blue-700" // Ganti bg-indigo ke bg-blue
              disabled={!allValid || passwordNotSynchronize || usernameError || emailError || isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isLoading ? "Memproses..." : "Daftar Akun"}
            </Button>

            <FieldSeparator />
            
            <div className="text-center text-xs text-slate-500">
              Sudah Punya Akun? <a href="/login" className="text-blue-600 font-bold hover:underline">Log in</a>
            </div>
          </FieldGroup>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="max-w-xs mx-auto flex flex-col gap-5 text-center p-2">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-800">Verifikasi Email</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Kode verifikasi telah dikirim ke: <br/>
              <span className="font-bold text-slate-900">{form.email}</span>
            </p>
          </div>
          
          <Input 
            placeholder="000000" 
            maxLength={6}
            className="text-center tracking-[0.8em] text-3xl font-mono h-16 border-2 focus:border-indigo-500"
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
            required 
          />
          
          <Button type="submit" className="w-full h-12 text-sm font-bold bg-blue-600" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Verifikasi Sekarang"}
          </Button>

          <button 
            type="button" 
            onClick={() => setStep(1)} 
            className="text-xs text-slate-400 hover:text-blue-600 font-medium transition-colors"
          >
            ← Kembali ke form pendaftaran
          </button>
        </form>
      )}
    </div>
  );
}