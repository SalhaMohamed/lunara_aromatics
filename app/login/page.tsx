"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/app/context/LanguageContext";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client"; // TUMETUMIA HII MPYA
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const { lang } = useLanguage();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  // Initialize Supabase Client
  const supabase = createClient();

  // WEKA EMAIL YAKO YA ADMIN HAPA (Kwa sasa tunatumia hii simple check)
  const ADMIN_EMAIL = "admin@lunara.com"; 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw error;
      }

      toast.success(lang === 'en' ? "Welcome Back!" : "Karibu Tena!");

      // MUHIMU: Refresh router ili Server Components (kama Navbar) zione session mpya
      router.refresh();

      // LOGIC YA KUELEKEZA (REDIRECT)
      if (data.user?.email === ADMIN_EMAIL) {
        router.push("/admin");
      } else if (returnUrl) {
        router.push(returnUrl);
      } else {
        router.push("/");
      }

    } catch (error: any) {
      toast.error(lang === 'en' ? error.message : "Barua pepe au nenosiri si sahihi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FCFCFC] text-stone-800 font-sans selection:bg-[#C5A059] selection:text-white">
      <Navbar />
      <div className="container mx-auto px-6 py-20 flex justify-center items-center min-h-[80vh]">
        <div className="w-full max-w-md bg-white p-10 shadow-xl shadow-stone-200/50 border border-stone-100 rounded-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif text-[#5B2C6F] mb-3">{lang === 'en' ? "Welcome Back" : "Karibu Tena"}</h1>
            <div className="h-0.5 w-12 bg-[#C5A059] mx-auto mb-3"></div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400">
              {lang === 'en' ? "The essence of luxury awaits" : "Harufu ya anasa inakusubiri"}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            {/* Email Input */}
            <div className="group relative">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-2 group-focus-within:text-[#5B2C6F] transition-colors">
                {lang === 'en' ? "Email Address" : "Barua Pepe"}
              </label>
              <div className="relative border-b border-stone-200 focus-within:border-[#C5A059] transition-colors duration-300">
                <Mail className="absolute left-0 top-3 text-stone-300 group-focus-within:text-[#5B2C6F] transition-colors" size={18} />
                <input 
                  type="email" 
                  className="w-full py-3 pl-8 outline-none bg-transparent font-light text-sm" 
                  placeholder="name@example.com" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  required 
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group relative">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-2 group-focus-within:text-[#5B2C6F] transition-colors">
                {lang === 'en' ? "Password" : "Nenosiri"}
              </label>
              <div className="relative border-b border-stone-200 focus-within:border-[#C5A059] transition-colors duration-300">
                <Lock className="absolute left-0 top-3 text-stone-300 group-focus-within:text-[#5B2C6F] transition-colors" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full py-3 pl-8 pr-10 outline-none bg-transparent font-light text-sm" 
                  placeholder="••••••••" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-0 top-3 text-stone-300 hover:text-[#5B2C6F] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#5B2C6F] text-white py-5 text-[11px] font-bold uppercase tracking-[0.3em] shadow-lg hover:shadow-xl hover:bg-[#4A235A] transition-all duration-300 flex items-center justify-center gap-3 disabled:bg-stone-300 disabled:cursor-not-allowed mt-4"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>{lang === 'en' ? "Sign In" : "Ingia"} <ArrowRight size={14} /></>}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-stone-50 text-center text-xs text-stone-400 tracking-wide">
            {lang === 'en' ? "Don't have an account?" : "Hauna akaunti?"}
            <Link href="/register" className="text-[#C5A059] ml-2 font-bold hover:underline tracking-tight transition-colors">
              {lang === 'en' ? "Register here" : "Jisajili hapa"}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}