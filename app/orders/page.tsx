"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
const supabase = createClient();
import { Package, Clock, CheckCircle, Truck, AlertCircle, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function UserOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // 1. Kazi ya kupata Status Step (1-4)
  const getStatusStep = (status: string) => {
    const steps: any = { pending: 1, processing: 2, shipped: 3, completed: 4 };
    return steps[status.toLowerCase()] || 1;
  };

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) toast.error("Imeshindwa kupata oda zako");
        else setOrders(data || []);
      }
      setLoading(false);
    };

    fetchUserAndOrders();

    // 2. REALTIME SUBSCRIPTION
    // Inasikiliza kama Admin amebadilisha status kule kwenye Database
    const channel = supabase
      .channel('user_order_updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload: any) => {
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.id === payload.new.id ? payload.new : order
            )
          );
          toast.success(`Oda yako #${payload.new.id.slice(0, 8)} imekuwa updated!`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'processing': return <Package size={14} />;
      case 'shipped': return <Truck size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-pulse font-serif text-[#5B2C6F] tracking-widest">LUNARA...</div>
    </div>
  );

  if (!user) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center">
          <ShoppingBag size={48} className="text-stone-100 mb-4" />
          <h2 className="text-xl font-serif text-[#5B2C6F] mb-4 uppercase tracking-widest">Tafadhali ingia kuona oda zako</h2>
          <Link href="/login?returnUrl=/orders" className="bg-[#5B2C6F] text-white px-8 py-3 uppercase text-[10px] font-bold tracking-widest hover:bg-[#4A235A] transition">Login Now</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Navbar />
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <header className="mb-10 text-center lg:text-left">
          <h1 className="text-3xl font-serif text-[#5B2C6F] uppercase tracking-widest">My Orders</h1>
          <p className="text-stone-400 text-[10px] mt-2 uppercase tracking-widest font-bold">Fuatilia safari ya oda zako hapa</p>
        </header>

        {orders.length === 0 ? (
          <div className="bg-white border border-stone-100 p-16 text-center rounded-sm shadow-sm">
            <Package size={40} className="mx-auto text-stone-200 mb-4" />
            <p className="text-stone-500 text-xs uppercase tracking-widest">Hujawahi kufanya oda yoyote bado.</p>
            <Link href="/shop" className="text-[#C5A059] text-[10px] font-black uppercase mt-6 inline-block border-b-2 border-[#C5A059] pb-1">Anza Shopping</Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-stone-100 p-6 rounded-sm shadow-sm">
                
                {/* Order Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Order ID: #{order.id.slice(0, 8)}</span>
                    <p className="text-[10px] text-stone-400 font-medium uppercase mt-1">{new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  
                  {/* Progress Indicator */}
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {[
                      { s: 'pending', i: <Clock size={12}/> },
                      { s: 'processing', i: <Package size={12}/> },
                      { s: 'shipped', i: <Truck size={12}/> },
                      { s: 'completed', i: <CheckCircle size={12}/> }
                    ].map((step, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          getStatusStep(order.status) >= index + 1 
                          ? 'bg-[#5B2C6F] text-white' 
                          : 'bg-stone-50 text-stone-300'
                        }`}>
                          {step.i}
                        </div>
                      </div>
                    ))}
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#5B2C6F] ml-2 border-l pl-3">
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="bg-stone-50/50 p-4 rounded-sm mb-6">
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-3">Items Ordered</p>
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-[11px] mb-2 last:mb-0">
                      <div className="flex gap-2 items-center">
                         <span className="text-stone-800 font-bold uppercase">{item.name}</span>
                         <span className="text-[#C5A059] font-black text-[9px]">{item.size}</span>
                         <span className="text-stone-400 font-bold italic">x{item.quantity}</span>
                      </div>
                      <span className="text-stone-900 font-medium">TZS {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Footer Info */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center pt-4 border-t border-stone-100 gap-4">
                  <div className="text-left w-full md:w-auto">
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">Delivery Method</p>
                    <p className="text-[10px] font-black text-stone-700 uppercase">{order.delivery_method}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Total Paid</p>
                    <p className="text-xl font-black text-[#5B2C6F] tracking-tight">TZS {order.total_amount.toLocaleString()}</p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}