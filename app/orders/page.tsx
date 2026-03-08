"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
const supabase = createClient();
import { Package, Clock, CheckCircle, Truck, AlertCircle, ShoppingBag, Hash } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useTranslation } from "@/app/hooks/useTranslation";

export default function UserOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const t = useTranslation();

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

        if (error) toast.error("Failed to find your orders");
        else setOrders(data || []);
      }
      setLoading(false);
    };

    fetchUserAndOrders();

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
          // Hapa tunatumia order_number kwenye toast ikipatikana
          const displayId = payload.new.order_number || payload.new.id.slice(0, 8);
          toast.success(`Order #${displayId} has been updated!`, {
            description: `Status: ${payload.new.status.toUpperCase()}`,
          });
        }
      )
      .subscribe();

    try { localStorage.removeItem('hasOrderUpdate'); } catch(e) {}
    try { window.dispatchEvent(new Event('ordersViewed')); } catch(e) {}

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-pulse font-serif text-[#5B2C6F] tracking-[0.3em] uppercase text-sm">{t.lunaraLoading}</div>
    </div>
  );

  if (!user) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center">
          <ShoppingBag size={48} className="text-stone-100 mb-4" />
          <h2 className="text-xl font-serif text-[#5B2C6F] mb-4 uppercase tracking-widest">{t.loginToSeeOrders}</h2>
          <Link href="/login?returnUrl=/orders" className="bg-[#5B2C6F] text-white px-8 py-3 uppercase text-[10px] font-bold tracking-widest hover:bg-black transition">{t.loginNow}</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Navbar />
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <header className="mb-10 text-center lg:text-left flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-stone-100 pb-8">
          <div>
            <h1 className="text-3xl font-serif text-[#5B2C6F] uppercase tracking-widest">{t.myOrders}</h1>
            <p className="text-stone-400 text-[10px] mt-2 uppercase tracking-[0.2em] font-bold">{t.trackElegance}</p>
          </div>
          <div className="bg-stone-50 px-4 py-2 rounded-full border border-stone-100">
            <p className="text-[9px] font-black text-stone-500 uppercase">{t.totalOrders}: {orders.length}</p>
          </div>
        </header>

        {orders.length === 0 ? (
          <div className="bg-white border border-stone-100 p-20 text-center rounded-sm shadow-sm">
            <Package size={40} className="mx-auto text-stone-100 mb-6" />
            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-8">{t.noOrdersYet}</p>
            <Link href="/shop" className="bg-[#5B2C6F] text-white px-10 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition">{t.exploreCollectionBtn}</Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-stone-100 p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                
                {/* Order Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="bg-[#5B2C6F]/5 p-2 rounded-sm text-[#5B2C6F]">
                      <Hash size={16} />
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-900 font-black uppercase tracking-wider">
                        Order {order.order_number || `#${order.id.slice(0, 8)}`}
                      </span>
                      <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">
                        {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Indicator */}
                  <div className="flex items-center gap-2 w-full md:w-auto bg-stone-50 p-2 rounded-full px-4">
                    {[
                      { s: 'pending', i: <Clock size={12}/> },
                      { s: 'processing', i: <Package size={12}/> },
                      { s: 'shipped', i: <Truck size={12}/> },
                      { s: 'completed', i: <CheckCircle size={12}/> }
                    ].map((step, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          getStatusStep(order.status) >= index + 1 
                          ? 'bg-[#5B2C6F] text-white shadow-sm' 
                          : 'bg-white text-stone-200 border border-stone-100'
                        }`}>
                          {step.i}
                        </div>
                        {index < 3 && (
                          <div className={`w-3 h-[2px] mx-1 ${getStatusStep(order.status) > index + 1 ? 'bg-[#5B2C6F]' : 'bg-stone-200'}`} />
                        )}
                      </div>
                    ))}
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#5B2C6F] ml-3 border-l border-stone-200 pl-3">
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-stone-50/50 p-4 rounded-sm border border-stone-50">
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <ShoppingBag size={10} /> Order Items
                    </p>
                    <div className="space-y-3">
                      {order.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-[11px]">
                          <div className="flex flex-col">
                            <span className="text-stone-800 font-bold uppercase">{item.name}</span>
                            <span className="text-[#C5A059] font-bold text-[9px] uppercase">Size: {item.size} • Qty: {item.quantity}</span>
                          </div>
                          <span className="text-stone-900 font-black">TZS {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-4 border border-stone-100 rounded-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Method</p>
                        <p className="text-[10px] font-black text-stone-700 uppercase flex items-center gap-2">
                          {order.delivery_method === 'delivery' ? <Truck size={12} className="text-[#C5A059]"/> : <Package size={12} className="text-[#C5A059]"/>}
                          {order.delivery_method}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-stone-400 uppercase mb-1">Total Paid</p>
                        <p className="text-xl font-black text-[#5B2C6F] tracking-tighter">TZS {order.total_amount.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {order.status === 'pending' && (
                       <div className="mt-4 p-2 bg-yellow-50 rounded flex items-center gap-2">
                          <AlertCircle size={12} className="text-yellow-600" />
                          <p className="text-[8px] text-yellow-700 font-bold uppercase tracking-tight">Waiting for payment verification</p>
                       </div>
                    )}
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