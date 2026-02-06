"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/app/data/translations";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // LOGIC YA MUDA: Tunakagua admin kwa sasa kabla ya kuunganisha Database
    if (email === "admin@lunara.com" && password === "admin123") {
      toast.success(lang === 'en' ? "Welcome Back, Admin!" : "Karibu Tena, Admin!");
      window.location.href = "/admin";
    } else {
      toast.error(lang === 'en' ? "Invalid email or password" : "Barua pepe au nenosiri si sahihi");
    }
  };

  return (
    <main className="min-h-screen bg-[#FCFCFC]">
      <Navbar />
      
      <div className="container mx-auto px-6 py-20 flex justify-center items-center">
        <div className="w-full max-w-md bg-white p-10 shadow-sm border border-stone-100 rounded-sm">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif text-[#5B2C6F] mb-3">
              {lang === 'en' ? "Welcome Back" : "Karibu Tena"}
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400">
              {lang === 'en' ? "The essence of luxury awaits" : "Harufu ya anasa inakusubiri"}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            {/* Email Input */}
            <div className="relative group">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-2 transition-colors group-focus-within:text-[#5B2C6F]">
                {lang === 'en' ? "Email Address" : "Barua Pepe"}
              </label>
              <div className="relative">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                <input 
                  type="email" 
                  className="w-full border-b border-stone-200 py-3 pl-8 outline-none focus:border-[#5B2C6F] transition-all bg-transparent font-light"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="relative group">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-2 transition-colors group-focus-within:text-[#5B2C6F]">
                {lang === 'en' ? "Password" : "Nenosiri"}
              </label>
              <div className="relative">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                <input 
                  type="password" 
                  className="w-full border-b border-stone-200 py-3 pl-8 outline-none focus:border-[#5B2C6F] transition-all bg-transparent font-light"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full bg-[#5B2C6F] text-white py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[#4A235A] transition-all duration-500 shadow-xl flex items-center justify-center gap-3 group"
            >
              {lang === 'en' ? "Sign In" : "Ingia"}
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          {/* Footer Link */}
          <div className="mt-12 pt-8 border-t border-stone-50 text-center">
            <p className="text-xs text-stone-400">
              {lang === 'en' ? "Don't have an account?" : "Hauna akaunti?"}
              <Link href="/register" className="text-[#C5A059] ml-2 font-bold hover:underline tracking-tight transition">
                {lang === 'en' ? "Register here" : "Jisajili hapa"}
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}