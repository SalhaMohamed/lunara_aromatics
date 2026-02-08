"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) toast.error("Imeshindwa kupata oda");
    else setOrders(data || []);
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) toast.error("Imeshindwa kubadili hali");
    else {
      toast.success(`Oda imekuwa ${newStatus}`);
      fetchOrders(); // Refresh list
    }
  };

  if (loading) return <div className="p-10 text-center">Inapakia oda...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-serif text-[#5B2C6F] mb-8 uppercase tracking-widest">Oda Zote (Admin)</h1>
      
      <div className="grid gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-6 rounded-lg shadow-sm border border-stone-100 flex flex-col md:flex-row justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                  order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {order.status}
                </span>
                <span className="text-xs text-stone-400">#{order.id.slice(0, 8)}</span>
              </div>
              <h3 className="font-bold text-stone-800">{order.customer_name} ({order.customer_phone})</h3>
              <p className="text-sm text-stone-500 mb-4">{new Date(order.created_at).toLocaleString('sw-TZ')}</p>
              
              <div className="space-y-1">
                {order.items.map((item: any, i: number) => (
                  <p key={i} className="text-xs text-stone-600">• {item.name} ({item.size}) x {item.quantity}</p>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-end justify-between">
              <p className="text-lg font-bold text-[#5B2C6F]">TZS {order.total_amount.toLocaleString()}</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => updateStatus(order.id, 'processing')} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Inashughulikiwa"><Clock size={18}/></button>
                <button onClick={() => updateStatus(order.id, 'completed')} className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100" title="Imekamilika"><CheckCircle size={18}/></button>
                <button onClick={() => updateStatus(order.id, 'cancelled')} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Futa Oda"><XCircle size={18}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}