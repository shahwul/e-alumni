"use client";
import { SignupForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  const [step, setStep] = useState(1); 
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
    <div className="flex min-h-svh items-center justify-center bg-slate-50 p-4 md:p-10"> 
      <div className="grid w-sm overflow-hidden rounded-[26px] bg-white shadow-sm lg:grid-cols-1">
        <div className="flex flex-col gap-4 p-6 md:p-5">
          <div className="flex justify-center gap-2 md:justify-center">
            <a href="#" className="flex items-center gap-2 font-medium item-center text-center">
              <div className=" flex size-15 items-center justify-center">     
                  <img
                    src="favicon.ico"
                    alt="Image"
                  />
              </div>
              <div className="grid col-2 justify-items-start gap-y-0">
                <div className="hidden text-xl font-bold sm:block leading-none m-0">
                E-alumni
                </div>
                <div className="hidden text-l sm:block  m-0">
                BBGTK DIY
                </div>
              </div>
            </a>    
          </div>
          <hr className="mx-auto border-t border-gray-300 mb-0 max-w-xs w-full" />
        
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full">
              <SignupForm />
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}