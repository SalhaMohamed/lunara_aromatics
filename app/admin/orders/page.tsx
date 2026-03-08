"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Package, Clock, CheckCircle, XCircle, Truck, Store, Copy, RefreshCw } from "lucide-react";

export default function AdminOrders() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- HAPA NDIPO MABADILIKO YA REALTIME YAPO ---
  useEffect(() => {
    // 1. Vuta data mara ya kwanza
    fetchOrders();

    // 2. Washa 'Sikio' la kusikiliza oda mpya au mabadiliko
    const channel = supabase
      .channel('admin_orders_page')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            toast.info("🔔 New Order Received!", { description: "Refreshing list..." });
            fetchOrders(); // Vuta data upya oda mpya ikiingia
          } else if (payload.eventType === 'UPDATE') {
            fetchOrders(); // Update ikifanyika (hata kama imefanywa na admin mwingine)
          }
        }
      )
      .subscribe();

    // 3. Zima channel ukiondoka kwenye page
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      toast.error("Failed to find orders");
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    // Optimistic update: Badilisha UI kwanza kabla ya server ili ionekane fasta
    const previousOrders = [...orders];
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      setOrders(previousOrders); // Rudisha data za zamani kama kimetokea kosa
      toast.error("Failed to change status");
    } else {
      toast.success(`Order status updated to ${newStatus.toUpperCase()}`);
      // Hatuhitaji kuita fetchOrders() hapa sababu Realtime listener itadaka mabadiliko
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Order ID Copied!");
  };

  // Helper kwa rangi za status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'delivered': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFCFC]">
      <div className="flex flex-col items-center gap-2 animate-pulse text-[#5B2C6F]">
        <RefreshCw className="animate-spin" />
        <span className="font-serif tracking-widest uppercase text-xs font-bold">Loading Orders...</span>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 bg-[#FCFCFC] min-h-screen text-stone-800">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#5B2C6F] font-bold uppercase tracking-widest">Oda Zote</h1>
          <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mt-1">Manage & Track Deliveries</p>
        </div>
        <div className="bg-white px-5 py-2 border border-stone-200 rounded-sm shadow-sm text-xs font-bold text-[#5B2C6F] uppercase tracking-widest">
          Total Orders: {orders.length}
        </div>
      </header>
      
      <div className="grid gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-6 rounded-sm shadow-sm border border-stone-100 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow relative overflow-hidden group">
            {/* Status Bar Indicator */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(order.status).replace('bg-', 'bg-').split(' ')[0]}`}></div>

            <div className="flex-grow pl-2">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-tighter border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                
                <div className="flex items-center gap-1 cursor-pointer" onClick={() => copyToClipboard(order.id)}>
                  <span className="text-[10px] font-mono font-bold text-stone-400">
                    #{order.order_number || order.id.slice(0, 8)}
                  </span>
                  <Copy size={10} className="text-stone-300 hover:text-[#C5A059]" />
                </div>

                <div className="flex items-center gap-1 text-[9px] font-bold uppercase text-stone-400 border-l border-stone-200 pl-3">
                  {order.delivery_method === 'delivery' ? <Truck size={12}/> : <Store size={12}/>}
                  {order.delivery_method}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                 <div>
                    <h3 className="font-black text-stone-800 uppercase text-sm">{order.customer_name}</h3>
                    <a href={`tel:${order.customer_phone}`} className="text-xs font-bold text-[#C5A059] hover:underline flex items-center gap-1 mt-1">
                        <span className="bg-[#C5A059]/10 p-1 rounded-full"><Store size={10}/></span> 
                        {order.customer_phone}
                    </a>
                 </div>
                 <div className="text-left md:text-right mt-2 md:mt-0">
                    <p className="text-[9px] font-bold text-stone-400 uppercase">Date Placed</p>
                    <p className="text-[11px] font-mono text-stone-600">
                        {new Date(order.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                 </div>
              </div>
              
              <div className="bg-stone-50 p-4 rounded-sm border border-stone-100">
                <p className="text-[9px] font-black text-[#5B2C6F] uppercase tracking-widest border-b border-stone-200 pb-2 mb-2">Order Items</p>
                <div className="space-y-2">
                    {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                        <span className="text-stone-600 font-medium flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-stone-300 rounded-full"></span> 
                            {item.name} <span className="text-[#C5A059] font-bold text-[10px] uppercase">({item.size})</span>
                        </span>
                        <span className="font-bold text-stone-800 bg-white border px-2 py-0.5 rounded-sm">x{item.quantity}</span>
                    </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between min-w-[160px] border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-6 mt-4 md:mt-0">
              <div className="text-right w-full">
                <p className="text-[9px] font-bold text-stone-400 uppercase mb-1">Total Paid</p>
                <p className="text-2xl font-serif font-black text-[#5B2C6F]">TZS {order.total_amount?.toLocaleString()}</p>
              </div>

              <div className="flex gap-2 mt-6 w-full justify-end">
                {order.status === 'pending' && (
                    <button 
                    onClick={() => updateStatus(order.id, 'processing')} 
                    className="flex-1 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-sm hover:bg-blue-600 hover:text-white transition flex flex-col items-center justify-center gap-1 group" 
                    title="Start Processing"
                    >
                    <Clock size={16} className="group-hover:scale-110 transition-transform"/>
                    <span className="text-[8px] font-bold uppercase">Process</span>
                    </button>
                )}
                
                {['pending', 'processing', 'shipped'].includes(order.status) && (
                    <button 
                    onClick={() => updateStatus(order.id, 'completed')} 
                    className="flex-1 py-2 bg-green-50 text-green-600 border border-green-100 rounded-sm hover:bg-green-600 hover:text-white transition flex flex-col items-center justify-center gap-1 group" 
                    title="Mark as Completed"
                    >
                    <CheckCircle size={16} className="group-hover:scale-110 transition-transform"/>
                    <span className="text-[8px] font-bold uppercase">Finish</span>
                    </button>
                )}
                
                {!['completed', 'cancelled'].includes(order.status) && (
                    <button 
                    onClick={() => updateStatus(order.id, 'cancelled')} 
                    className="flex-1 py-2 bg-red-50 text-red-600 border border-red-100 rounded-sm hover:bg-red-600 hover:text-white transition flex flex-col items-center justify-center gap-1 group" 
                    title="Cancel Order"
                    >
                    <XCircle size={16} className="group-hover:scale-110 transition-transform"/>
                    <span className="text-[8px] font-bold uppercase">Cancel</span>
                    </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && !loading && (
        <div className="text-center py-24 bg-white border border-dashed border-stone-200 rounded-sm animate-in fade-in zoom-in">
          <div className="bg-stone-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={32} className="text-stone-300" />
          </div>
          <p className="text-stone-400 font-serif italic text-sm">Hakuna oda yoyote kwa sasa...</p>
          <p className="text-[10px] text-stone-300 uppercase font-bold tracking-widest mt-2">Waiting for new orders</p>
        </div>
      )}
    </div>
  );
}