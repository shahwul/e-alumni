import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { User, Mail, Eye, EyeOff, X, Check, CircleAlert, IdCardLanyard } from "lucide-react";

export function SignupForm({className, ...props }) {
  const [step, setStep] = useState(1); // 1: Form, 2: OTP
  const [form, setForm] = useState({ username: "", password: "", email: "", nama: "" });
  const [otp, setOtp] = useState();
  const router = useRouter();
  const [checkTimeout, setCheckTimeout] = useState(null);
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordNotSynchronize, setPasswordNotSynchronize] = useState(false);
  const [emailNotAvailable, setEmailNotAvailable] = useState(false);
  const [usernameNotAvailable, setUsernameNotAvailable] = useState(false);
  const validations = [
    { text: "Minimal 8 karakter", valid: password.length >= 8 },
    { text: "Huruf besar", valid: /[A-Z]/.test(password) },
    { text: "Huruf kecil", valid: /[a-z]/.test(password) },
    { text: "Angka (0-9)", valid: /[0-9]/.test(password) }, 
    { text: "Simbol (!@#$%^&*)", valid: /[!@#$%^&*]/.test(password) },
  ]

  const passwordCheck = (confirmValue) => {
    if (password !== confirmValue) {
      setPasswordNotSynchronize(true);
    } else {
      setPasswordNotSynchronize(false);
    }
  };
  
  const checkAvailability = async (field, value) => {
  if (value.trim() === "") {
    if (field === "username") setUsernameNotAvailable(false);
    if (field === "email") setEmailNotAvailable(false);
    return;
  }
  if (checkTimeout) clearTimeout(checkTimeout);

  const timeout = setTimeout(async () => {
    try {
      const res = await fetch("/api/auth/register", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Kita kirim objek minimalis agar tidak kena validasi "Data tidak lengkap" di backend
        body: JSON.stringify({ 
          username: field === "username" ? value : "temp_check", 
          email: field === "email" ? value : "temp_check@mail.com",
          password: "check_only_password" 
        }),
      });

      if (res.status === 400) {
        const data = await res.json();
        if (field === "username" && data.message.includes("Username")) setUsernameNotAvailable(true);
        if (field === "email" && data.message.includes("Email")) setEmailNotAvailable(true);
      } else {
        if (field === "username") setUsernameNotAvailable(false);
        if (field === "email") setEmailNotAvailable(false);
      }
    } catch (err) {
      console.error("Gagal cek data:", err);
    }
  }, 500);

  setCheckTimeout(timeout);
  };


  const togglePassword = () => {setShowPassword(!showPassword)} 
  const toggleConfirmPassword = () => {setShowConfirmPassword(!showConfirmPassword)};
  
  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(form),
    });
    if (res.ok) setStep(2);
    else alert("Gagal kirim OTP", error);
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
    
    <div>
      {step === 1 ? (
        <form onSubmit={handleRegister}>
            <FieldGroup className="flex flex-col gap-3 max-w-xs mx-auto">
              <div className="flex flex-col gap-1 relative">
                <h1 className="text-xl font-bold text-center">Daftar Akun Baru</h1>
                <p className="text-muted-foreground text-sm text-center gap-y-5">
                  Isi form di bawah untuk membuat akun baru
                </p>
              </div>
              <Field>
                <div className="relative">
                  <Input 
                    id="nama" 
                    type="text" 
                    placeholder="Nama Lengkap"  
                    className="pr-12 text-sm"
                    required 
                    onChange={(e)=>setForm({...form, nama: e.target.value})}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center justify-center w-10 bg-slate-100 border border-input rounded-r-md pointer-events-none">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
              </Field>
              <Field>
                <div className="relative">
                  <Input 
                    id="username" 
                    type="text" 
                    placeholder="Username" 
                    className="pr-12 text-sm"
                    required 
                    onChange={(e) => {
                    const val = e.target.value;
                    setForm({ ...form, username: val });
                    checkAvailability("username", val); // Cek ketersediaan
                  }}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center justify-center w-10 bg-slate-100 border border-input rounded-r-md pointer-events-none">
                    <IdCardLanyard className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
              </Field>
              {usernameNotAvailable && (
                <div className="leading-none ml-2 -mt-2 flex items-center gap-1 gap-y-0">
                  <CircleAlert className="w-3 h-3 text-red-600" />
                  <span className="text-xs text-red-600 font-medium">
                    Username tidak tersedia
                  </span>
                </div>
              )}

          
              <Field>
                <div className="relative">
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Email" 
                    className="pr-12 text-sm"
                    required 
                    onChange={(e) => {
                    const val = e.target.value;
                    setForm({ ...form, email: val });
                    checkAvailability("email", val); // Cek ketersediaan
                  }}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center justify-center w-10 bg-slate-100 border border-input rounded-r-md pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
              </Field>
              {emailNotAvailable && (
                <div className="leading-none ml-2 -mt-2 flex items-center gap-1 gap-y-0">
                  <CircleAlert className="w-3 h-3 text-red-600" />
                  <span className="text-xs text-red-600 font-medium">
                    Email tidak tersedia
                  </span>
                </div>
              )}
              <Field>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="Password" 
                    className="pr-12 text-sm"
                    onChange={(e)=>setForm({...form, password: e.target.value}, setPassword(e.target.value))}
                    value={password}
                    required 
                  />
                  <button
                      type="button"
                      onClick={togglePassword}
                      className="absolute inset-y-0 right-0 flex items-center justify-center w-10 bg-slate-100 border border-input rounded-r-md hover:bg-slate-200 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-500" />
                      )}
                    </button>
                </div>
              </Field>
              <Field>
                <div className="relative">
                  <Input 
                    id="confirm-password" 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ulangi Password" 
                    className="pr-12 text-sm"
                    onChange={(e)=> passwordCheck(e.target.value)}
                    required 
                  />
                  <button
                      type="button"
                      onClick={toggleConfirmPassword}
                      className="absolute inset-y-0 right-0 flex items-center justify-center w-10 bg-slate-100 border border-input rounded-r-md hover:bg-slate-200 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-500" />
                      )}
                    </button>
                </div>
              </Field>
              {passwordNotSynchronize && (
                <div className="leading-none ml-2 -mt-2 flex items-center gap-1 gap-y-0">
                  <CircleAlert className="w-3 h-3 text-red-600" />
                  <span className="text-xs text-red-600 font-medium">
                    Password tidak sinkron
                  </span>
                </div>
              )}
              {/* password validation check */}
              <div className="grid grid-cols-2">
                {validations.map((validation, index) => (
                  <div
                    className={`flex items-center gap-2 text-xs ${
                      validation.valid ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                    }`}
                    key={index}
                  >
                    {validation.valid ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    <span>{validation.text}</span>
                  </div>
                ))}
              </div>
              <Field>
                <Button 
                type="submit"
                disabled={usernameNotAvailable || emailNotAvailable || passwordNotSynchronize}
                >Buat Akun</Button>
              </Field>
              <FieldSeparator></FieldSeparator>
              <Field>
                <FieldDescription className="px-6 text-center">
                  Sudah Punya Akun? <a href="/login">Log in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4 text-center">
            <h1 className="text-2xl font-bold text-slate-800">Verifikasi OTP</h1>
            <p className="text-sm text-slate-500">Cek email: {form.email}</p>
            <input 
              placeholder="Masukkan 6 Digit OTP" 
              className="w-full p-3 border rounded-xl text-center tracking-widest text-xl font-bold placeholder-black/50-s" 
              onChange={(e) => setOtp(e.target.value)} 
            />
            <button type = "submit" className="w-full bg-blue-500 text-white p-2 rounded-md text-sm font-semibold">Verifikasi</button>
          </form>
        )}
    </div>
  )
}
