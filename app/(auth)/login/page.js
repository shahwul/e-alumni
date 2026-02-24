"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";

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
    <div className="flex min-h-svh items-center justify-center bg-slate-50 p-4 md:p-10">
      <div className="grid w-sm overflow-hidden rounded-[26px] bg-white shadow-sm lg:grid-cols-1">
        <div className="flex flex-col gap-4 p-6 md:p-5">
          <div className="flex justify-center gap-2 md:justify-center">
            <a
              href="#"
              className="flex items-center gap-2 font-medium item-center text-center"
            >
              <div className=" flex size-15 items-center justify-center">
                <img src="favicon.ico" alt="Logo" />
              </div>
              <div className="grid col-2 justify-items-start gap-y-0">
                <div className="hidden text-xl font-bold sm:block leading-none m-0">
                  E-alumni
                </div>
                <div className="hidden text-l sm:block  m-0">BBGTK DIY</div>
              </div>
            </a>
          </div>
          <hr className="mx-auto border-t border-gray-300 mb-0 max-w-xs w-full" />
          <div className="flex flex-col gap-1 relative">
            <h1 className="text-xl font-bold text-center">Login Akun</h1>
            <p className="text-muted-foreground text-sm text-center ">
              Silahkan login dengan akun anda.
            </p>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
