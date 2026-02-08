"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, Loader2, Phone, Eye, EyeOff } from "lucide-react"; 
import { createClient } from "@/lib/supabase/client"; // IMPORT HII MPYA
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  
  // Initialize Supabase Client for Browser
  const supabase = createClient();

  // Validating Strong Password
  const isPasswordStrong = (pass: string) => {
    return pass.length >= 6; // Nimepunguza kidogo iwe user friendly, ila unaweza kurudisha 8
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordStrong(formData.password)) {
      toast.error("Nenosiri liwe na angalau herufi 6.");
      return;
    }

    setLoading(true);

    try {
      // 1. Tuma data kwa Supabase Auth
      // HAPA NDIPO UCHAWI ULIPO: Tunatuma data kwenye 'options'
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name, // Hii itaenda kwenye raw_user_meta_data
            phone_number: formData.phone,
            discount_code: `LUNA-${Math.floor(1000 + Math.random() * 9000)}`
          },
        },
      });

      if (error) throw error;

      // 2. Success Feedback
      toast.success(`Karibu Lunara, ${formData.name}!`);
      
      // 3. Redirect au Refresh
      // Kama unatumia Email Verification, mwambie acheck email.
      // Kama huna verification (auto-confirm), mpeleke dashboard au login.
      router.push("/login");

    } catch (error: any) {
      console.error("Registration Error:", error);
      toast.error(error.message || "Tatizo limetokea wakati wa kusajili.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FCFCFC] text-stone-800 font-sans selection:bg-[#C5A059] selection:text-white">
      <Navbar />
      <div className="container mx-auto px-6 py-20 flex justify-center items-center min-h-[80vh]">
        <div className="w-full max-w-md bg-white p-10 shadow-xl shadow-stone-200/50 border border-stone-100 rounded-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-serif text-[#5B2C6F] mb-3 font-bold">Create Account</h1>
            <div className="h-0.5 w-12 bg-[#C5A059] mx-auto mb-3"></div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400">Join the world of Lunara</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {/* Full Name Input */}
            <div className="group relative border-b border-stone-200 focus-within:border-[#C5A059] transition-colors duration-300">
              <User className="absolute left-0 top-3 text-stone-300 group-focus-within:text-[#5B2C6F] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Full Name" 
                required 
                className="w-full py-3 pl-8 outline-none bg-transparent font-light text-sm placeholder:text-stone-300"
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                value={formData.name} 
              />
            </div>
            
            {/* Phone Input */}
            <div className="group relative border-b border-stone-200 focus-within:border-[#C5A059] transition-colors duration-300">
              <Phone className="absolute left-0 top-3 text-stone-300 group-focus-within:text-[#5B2C6F] transition-colors" size={18} />
              <input 
                type="tel" 
                placeholder="Phone Number (e.g. 07XXXXXXXX)" 
                required 
                className="w-full py-3 pl-8 outline-none bg-transparent font-light text-sm placeholder:text-stone-300"
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                value={formData.phone} 
              />
            </div>

            {/* Email Input */}
            <div className="group relative border-b border-stone-200 focus-within:border-[#C5A059] transition-colors duration-300">
              <Mail className="absolute left-0 top-3 text-stone-300 group-focus-within:text-[#5B2C6F] transition-colors" size={18} />
              <input 
                type="email" 
                placeholder="Email Address" 
                required 
                className="w-full py-3 pl-8 outline-none bg-transparent font-light text-sm placeholder:text-stone-300"
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                value={formData.email} 
              />
            </div>

            {/* Password Input */}
            <div className="group relative border-b border-stone-200 focus-within:border-[#C5A059] transition-colors duration-300">
              <Lock className="absolute left-0 top-3 text-stone-300 group-focus-within:text-[#5B2C6F] transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                required 
                className="w-full py-3 pl-8 pr-10 outline-none bg-transparent font-light text-sm placeholder:text-stone-300"
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                value={formData.password} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-0 top-3 text-stone-300 hover:text-[#5B2C6F] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button 
              disabled={loading} 
              className="w-full bg-[#5B2C6F] text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#4A235A] transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-stone-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-4"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>Create Account <ArrowRight size={14} /></>}
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-stone-50 text-center text-xs text-stone-400 tracking-wide">
            Already a member? <Link href="/login" className="text-[#C5A059] ml-2 font-bold hover:underline transition-all">Sign In</Link>
          </div>
        </div>
      </div>
    </main>
  );
}