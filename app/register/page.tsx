"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  return (
    <main className="min-h-screen bg-[#FCFCFC]">
      <Navbar />
      <div className="container mx-auto px-6 py-20 flex justify-center">
        <div className="w-full max-w-md bg-white p-10 shadow-sm border border-stone-100">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-serif text-[#5B2C6F] mb-2">Create Account</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400">Join the world of Lunara</p>
          </div>

          <form className="space-y-6">
            <div className="relative">
              <User className="absolute left-0 top-2 text-stone-300" size={18} />
              <input 
                type="text" 
                placeholder="Full Name"
                className="w-full border-b border-stone-200 py-2 pl-8 outline-none focus:border-[#C5A059] transition font-light"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="relative">
              <Mail className="absolute left-0 top-2 text-stone-300" size={18} />
              <input 
                type="email" 
                placeholder="Email Address"
                className="w-full border-b border-stone-200 py-2 pl-8 outline-none focus:border-[#C5A059] transition font-light"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-0 top-2 text-stone-300" size={18} />
              <input 
                type="password" 
                placeholder="Password"
                className="w-full border-b border-stone-200 py-2 pl-8 outline-none focus:border-[#C5A059] transition font-light"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button className="w-full bg-[#5B2C6F] text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#4A235A] transition flex items-center justify-center gap-2 group">
              Register Now
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-stone-50 text-center">
            <p className="text-xs text-stone-400">
              Already have an account? 
              <Link href="/login" className="text-[#C5A059] ml-2 font-bold hover:underline">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}