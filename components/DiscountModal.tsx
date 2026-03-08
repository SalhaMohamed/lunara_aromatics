"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Gift, Star, UserPlus, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client"; // IMEREKEBISHWA HAPA

export default function DiscountModal() {
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient(); // INITIALIZE CLIENT

  useEffect(() => {
    const checkEligibility = async () => {
      const shown = localStorage.getItem("discount_shown");
      if (shown === "true") return;

      // Angalia kama mteja amelogin kwa kutumia client mpya
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_code_used')
          .eq('id', user.id)
          .single();

        if (profile?.is_code_used) {
          localStorage.setItem("discount_shown", "true");
          return;
        }
      }

      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    };

    checkEligibility();
  }, [supabase]); // Ongeza supabase hapa

  const closeMenu = () => {
    setIsOpen(false);
    localStorage.setItem("discount_shown", "true");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-stone-900/70 backdrop-blur-sm">
      <div className="relative bg-white w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-500 rounded-sm">
        <button onClick={closeMenu} className="absolute top-4 right-4 text-stone-400 hover:text-black z-10 transition">
          <X size={24} />
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-[#5B2C6F] p-10 text-white flex flex-col justify-center items-center text-center space-y-4">
            <div className="p-4 bg-white/10 rounded-full">
              <Star size={40} className="text-[#C5A059]" />
            </div>
<h2 className="text-2xl font-serif tracking-widest uppercase">Bahmad Privilege</h2>
            <p className="text-[10px] font-light tracking-[0.2em] opacity-70">EXCLUSIVE ACCESS & REWARDS</p>
          </div>
          <div className="p-10 space-y-8">
            <div className="space-y-2">
              <h3 className="text-xl font-serif text-stone-800">Welcome to Bahmad Perfumes</h3>
              <p className="text-xs text-stone-500 leading-relaxed">Choose a way to join us and start enjoying luxirious smell at an affordable price.</p>
            </div>
            <div className="space-y-4">
              <Link href="/register" onClick={closeMenu} className="group flex items-center justify-between p-4 border border-stone-100 hover:border-[#C5A059] transition rounded-sm">
                <div className="flex items-center gap-3">
                  <UserPlus size={20} className="text-[#C5A059]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-800">New Member</p>
                    <p className="text-[11px] text-stone-500 italic">Get 10% OFF First Order</p>
                  </div>
                </div>
                <Gift size={16} className="text-[#C5A059] group-hover:scale-125 transition" />
              </Link>
              <Link href="/login" onClick={closeMenu} className="group flex items-center justify-between p-4 border border-stone-100 hover:border-[#5B2C6F] transition rounded-sm">
                <div className="flex items-center gap-3">
                  <Star size={20} className="text-[#5B2C6F]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-800">Member Login</p>
                    <p className="text-[11px] text-stone-500 italic">Redeem Loyalty Points</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-[#5B2C6F] group-hover:translate-x-1 transition" />
              </Link>
            </div>
            <button onClick={closeMenu} className="w-full text-[9px] uppercase tracking-[0.3em] text-stone-400 hover:text-stone-800 transition">
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}