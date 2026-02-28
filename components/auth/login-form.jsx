import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { User, Eye, EyeOff, CircleAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function LoginForm({ className, ...props }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false)
  const togglePassword = () => { setShowPassword(!showPassword) }
  const [loginFailed, setLoginFailed] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ open: false, title: "", message: "" });

  const showAlert = (title, message) => setAlertConfig({ open: true, title, message });

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
        showAlert("Login Gagal", data.message || "Username atau password salah");
        setLoginFailed(true);
      }
    } catch (err) {
      showAlert("Error", "Gagal koneksi ke server");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div>
      <form onSubmit={handleLogin}>
        <FieldGroup className="flex flex-col gap-3 max-w-xs mx-auto">
          <Field>
            <div className="relative">
              <Input
                id="username"
                type="text"
                placeholder="Username"
                className="pr-12 text-sm"
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center justify-center w-10 bg-slate-100 border border-input rounded-r-md pointer-events-none">
                <User className="h-4 w-4 text-slate-500" />
              </div>
            </div>
          </Field>
          <Field>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="pr-12 text-sm"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
            {loginFailed && (
              <div className="leading-none ml-2 -mt-2 flex items-center gap-1 gap-y-0">
                <CircleAlert className="w-3 h-3 text-red-600" />
                <span className="text-xs text-red-600 font-medium">
                  Username atau password salah
                </span>
              </div>
            )}
          </Field>
          <Field>
            <Button
              disabled={loading}
              type="submit">
              {loading ? "Loading..." : "Masuk"}
            </Button>
          </Field>
          <FieldSeparator></FieldSeparator>
          <Field>
            <FieldDescription className="px-6 text-center">
              Belum Punya Akun? <a href="/register">Sign Up</a>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>

      <AlertDialog open={alertConfig.open} onOpenChange={(o) => setAlertConfig(p => ({ ...p, open: o }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertConfig.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertConfig(p => ({ ...p, open: false }))}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
