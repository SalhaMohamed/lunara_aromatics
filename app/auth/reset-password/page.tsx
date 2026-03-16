"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFCFC] p-6">
      <div className="max-w-md w-full bg-white p-8 shadow-lg border border-stone-100">
        <h1 className="text-2xl font-serif text-[#5B2C6F] mb-6 text-center">New Password</h1>
        <form onSubmit={handleReset} className="space-y-4">
          <input 
            type="password" 
            placeholder="Enter new password"
            className="w-full p-3 border-b border-stone-200 outline-none focus:border-[#C5A059]"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button 
            disabled={loading}
            className="w-full bg-[#5B2C6F] text-white py-4 uppercase tracking-widest text-xs font-bold hover:bg-[#4A235A]"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}