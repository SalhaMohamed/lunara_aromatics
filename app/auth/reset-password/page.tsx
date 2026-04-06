"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  // 1. HII NI MUHIMU: Inahakikisha session ya email inatambulika mteja anapofungua link
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        toast.error("Session expired or invalid link. Please request a new one.");
        // Unaweza kumrudisha kwenye page ya forgot password hapa
      }
    };
    checkSession();
  }, [supabase]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    // 2. Kusasisha password kwa mtumiaji mwenye session hai
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      
      // 3. Ni vizuri kumtoa nje (Sign Out) ili aingie upya na password mpya kwa usalama
      await supabase.auth.signOut();
      
      // Mpeleke kwenye login
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] p-6">
      <div className="max-w-md w-full bg-white p-10 shadow-2xl rounded-2xl border border-stone-100">
        
        {/* Branding Section */}
        <div className="text-center mb-10">
          <h2 className="text-[#C5A059] text-[10px] font-bold tracking-[0.4em] uppercase mb-3">
            Secure Your Account
          </h2>
          <h1 className="text-3xl font-serif text-[#5B2C6F] font-bold">New Password</h1>
          <div className="w-12 h-[2px] bg-[#C5A059] mx-auto mt-4"></div>
        </div>

        <form onSubmit={handleReset} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">
              Create New Password
            </label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-[#5B2C6F] text-white py-4 rounded-xl uppercase tracking-[0.3em] text-[11px] font-bold hover:bg-[#4A235A] transition-all shadow-lg shadow-[#5B2C6F]/20 disabled:opacity-50"
          >
            {loading ? "Saving Changes..." : "Update Password"}
          </button>
        </form>

        <p className="mt-8 text-center text-stone-400 text-xs">
          Back to <a href="/login" className="text-[#C5A059] hover:underline">Login Page</a>
        </p>
      </div>
    </div>
  );
}