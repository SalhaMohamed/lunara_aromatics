"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Plus, Package, BarChart3, X, Loader2, Trash2, Upload, 
  ShoppingCart, User, Edit3, Phone, Search, Wallet, Home, LogOut
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner"; 
import Image from "next/image";

// --- Sub-Component for Sidebar Navigation ---
function NavItem({ active, onClick, icon, label }: any) {
  return (
    <div 
      onClick={onClick} 
      className={`flex items-center gap-3 p-3 rounded-sm cursor-pointer transition-all ${
        active ? 'bg-white/10 text-[#C5A059]' : 'hover:bg-white/5 text-stone-300'
      }`}
    >
      {icon} <span className="tracking-widest uppercase text-[9px] font-black">{label}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [orderFilter, setOrderFilter] = useState("active"); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // MODIFIED: Added wholesale fields
  const [formData, setFormData] = useState({
    name: "", price: "", category: "perfumes", gender: "unisex", description: "",
    image_url: "", size1: "", size2: "", size3: "",
    wholesale_price: "", wholesale_min_qty: "6"
  });

  // Fetching Data from Supabase
  const fetchData = async () => {
    try {
      const { data: prodData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      const { data: orderData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      const { data: userData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });

      if (prodData) setProducts(prodData);
      if (orderData) setOrders(orderData);
      if (userData) setCustomers(userData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // --- HAPA NDIPO NIMEPADILISHA (REALTIME UPDATES) ---
  useEffect(() => {
    // 1. Vuta data mara ya kwanza
    fetchData();

    // 2. Washa "Sikio" la kusikiliza mabadiliko (Orders & Products)
    const channel = supabase
      .channel('admin_dashboard_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          // Pale mabadiliko yanapotokea kwenye Orders
          if (payload.eventType === 'INSERT') {
            toast.info("🔔 New Order Received!", { description: "Refreshing dashboard..." });
          } else if (payload.eventType === 'UPDATE') {
             // Hatupigi kelele sana kwenye update ili tusiwe kero, tunarefresh tu
          }
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' }, // Pia tunasikiliza products
        () => fetchData()
      )
      .subscribe();

    // 3. Zima channel ukiondoka kwenye page
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  // --- MWISHO WA MABADILIKO ---

  // Business Stats Logic
  const stats = useMemo(() => {
    const totalSales = orders
      .filter(o => o.status === 'delivered' || o.status === 'completed')
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);
    
    const activeOrders = orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length;
    
    return { totalSales, activeOrders };
  }, [orders]);

  // Filtering Logic
  const filteredOrders = orders.filter(o => 
    orderFilter === 'active' 
      ? ['pending', 'processing', 'shipped'].includes(o.status)
      : ['delivered', 'completed', 'cancelled'].includes(o.status)
  );

  const filteredCustomers = customers.filter(c => 
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone_number?.includes(searchTerm)
  );

  // Actions
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) {
      toast.error("Fail to change status!");
    } else {
      toast.success(`The status changed to : ${newStatus.toUpperCase()}`);
      // Hatuhitaji kuita fetchData() hapa kwa sababu Realtime itafanya kazi hiyo automatically
    }
  };

  const handleAdminLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("logout successed");
      router.push('/login');
    } catch (err: any) {
      toast.error("Fail to logout");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
      
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setFormData({ ...formData, image_url: data.publicUrl });
      toast.success("Picture uploaded seccessfully!");
    } catch (error: any) {
      toast.error("Fail to upload the picture: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Do you really want to delete the product?: ${name}?`)) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) toast.error("Fail to delete the product!");
      else { toast.success("Product deleted!"); /* fetchData() itaitwa na realtime */ }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const sizesArray = [formData.size1, formData.size2, formData.size3]
      .map(s => s.trim())
      .filter(s => s !== "");

    // MODIFIED: Payload now includes wholesale data
    const payload = { 
      name: formData.name, 
      price: parseFloat(formData.price), 
      category: formData.category,
      gender: formData.gender,
      description: formData.description, 
      image_url: formData.image_url, 
      sizes: sizesArray,
      wholesale_price: formData.wholesale_price ? parseFloat(formData.wholesale_price) : null,
      wholesale_min_qty: formData.wholesale_min_qty ? parseInt(formData.wholesale_min_qty) : 6
    };

    const { error } = editMode && currentId 
      ? await supabase.from('products').update(payload).eq('id', currentId)
      : await supabase.from('products').insert([payload]);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editMode ? "Product has been updated!" : "New product is added!");
      setIsModalOpen(false);
      setFormData({ 
        name: "", price: "", category: "perfumes", gender: "unisex", description: "", 
        image_url: "", size1: "", size2: "", size3: "", 
        wholesale_price: "", wholesale_min_qty: "6" 
      });
      setEditMode(false);
      // fetchData() not needed here, realtime will catch it
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-[#FCFCFC] font-sans text-stone-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#5B2C6F] text-white p-6 space-y-8 hidden md:block sticky top-0 h-screen">
        <h2 className="text-2xl font-serif font-bold italic text-center">Lunara Admin</h2>
        <nav className="space-y-2 text-sm font-medium">
          <NavItem active={false} onClick={() => router.push('/')} icon={<Home size={18}/>} label="Home" />
          <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<BarChart3 size={18}/>} label="Overview" />
          <NavItem active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Package size={18}/>} label="Inventory" />
          <NavItem active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingCart size={18}/>} label="Orders" />
          <NavItem active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} icon={<User size={18}/>} label="Customers" />
          <div className="pt-4">
            <NavItem active={false} onClick={handleAdminLogout} icon={<LogOut size={18}/>} label="Logout" />
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* OVERVIEW SECTION */}
        {activeTab === "overview" && (
          <div className="animate-in fade-in duration-500">
            <h1 className="text-2xl font-serif text-[#5B2C6F] mb-8 font-bold uppercase tracking-widest">Business Report</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <div className="bg-white p-6 border-l-4 border-[#C5A059] shadow-sm rounded-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-stone-400 text-[9px] uppercase font-black tracking-widest mb-1">Total Revenue</p>
                    <h3 className="text-xl font-bold text-stone-800">TZS {stats.totalSales.toLocaleString()}</h3>
                  </div>
                  <Wallet className="text-[#C5A059]/20" size={24} />
                </div>
              </div>
              <div className="bg-white p-6 border-l-4 border-blue-500 shadow-sm rounded-sm">
                <p className="text-stone-400 text-[9px] uppercase font-black tracking-widest mb-1">Active Orders</p>
                <h3 className="text-xl font-bold text-stone-800">{stats.activeOrders}</h3>
              </div>
              <div className="bg-white p-6 border-l-4 border-[#5B2C6F] shadow-sm rounded-sm">
                <p className="text-stone-400 text-[9px] uppercase font-black tracking-widest mb-1">Total Customers</p>
                <h3 className="text-xl font-bold text-stone-800">{customers.length}</h3>
              </div>
              <div className="bg-white p-6 border-l-4 border-green-500 shadow-sm rounded-sm">
                <p className="text-stone-400 text-[9px] uppercase font-black tracking-widest mb-1">Items in Stock</p>
                <h3 className="text-xl font-bold text-stone-800">{products.length}</h3>
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY SECTION */}
        {activeTab === "products" && (
          <div className="animate-in fade-in">
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold font-serif text-[#5B2C6F]">Inventory</h1>
              <button 
                onClick={() => { 
                  setFormData({ 
                    name: "", price: "", category: "perfumes", gender: "unisex", description: "", 
                    image_url: "", size1: "", size2: "", size3: "",
                    wholesale_price: "", wholesale_min_qty: "6"
                  });
                  setEditMode(false); 
                  setIsModalOpen(true); 
                }} 
                className="bg-[#C5A059] text-white px-5 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
              >
                <Plus size={16}/> Add Product
              </button>
            </header>
            <div className="bg-white border border-stone-100 rounded-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 text-[9px] tracking-widest uppercase text-stone-400">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Retail Price</th>
                      <th className="p-4">Wholesale</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                      {products.map(p => (
                        <tr key={p.id} className="text-sm">
                          <td className="p-4 font-medium uppercase text-xs tracking-tighter">
                            <div className="flex items-center gap-3">
                              {p.image_url && <div className="w-8 h-8 relative bg-stone-50 border rounded-sm overflow-hidden"><Image src={p.image_url} alt="" fill className="object-contain" /></div>}
                              <div>
                                <p className="font-bold">{p.name}</p>
                                <p className="text-[8px] text-stone-400 uppercase tracking-widest">{p.category} • {p.gender}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono">TZS {p.price.toLocaleString()}</td>
                          <td className="p-4">
                            {p.wholesale_price ? (
                              <div className="text-[10px] uppercase font-black text-[#C5A059]">
                                TZS {p.wholesale_price.toLocaleString()} <span className="text-stone-300 ml-1">({p.wholesale_min_qty}+ pcs)</span>
                              </div>
                            ) : (
                              <span className="text-[9px] text-stone-300 uppercase">Not Set</span>
                            )}
                          </td>
                          <td className="p-4 text-right space-x-4">
                              <button onClick={() => { 
                                setEditMode(true); 
                                setCurrentId(p.id);
                                setFormData({
                                  name: p.name, price: p.price, category: p.category, gender: p.gender || "unisex", description: p.description,
                                  image_url: p.image_url, size1: p.sizes?.[0]||"", size2: p.sizes?.[1]||"", size3: p.sizes?.[2]||"",
                                  wholesale_price: p.wholesale_price || "", wholesale_min_qty: p.wholesale_min_qty || "6"
                                });
                                setIsModalOpen(true);
                              }} className="text-stone-300 hover:text-blue-500"><Edit3 size={16}/></button>
                              <button onClick={() => handleDelete(p.id, p.name)} className="text-stone-300 hover:text-red-500"><Trash2 size={16}/></button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
            </div>
          </div>
        )}

        {/* CUSTOMERS */}
        {activeTab === "customers" && (
          <div className="animate-in fade-in">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold font-serif text-[#5B2C6F]">Customer Directory</h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search customer..." 
                    className="pl-10 pr-4 py-2 border rounded-sm text-xs outline-none focus:border-[#C5A059]" 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </div>
            </header>
            <div className="bg-white border border-stone-100 rounded-sm">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 text-[9px] tracking-widest uppercase text-stone-400 border-b">
                    <tr>
                      <th className="p-4">Name</th>
                      <th className="p-4">Contact (Phone)</th>
                      <th className="p-4">Offer Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {filteredCustomers.map(c => (
                      <tr key={c.id} className="text-sm">
                        <td className="p-4 font-bold text-stone-700">{c.full_name || 'No Name'}</td>
                        <td className="p-4">
                          <span className="bg-stone-100 px-3 py-1 rounded-full text-[#5B2C6F] font-mono text-xs">
                            {c.phone_number || 'Namba haipo'}
                          </span>
                        </td>
                        <td className="p-4">
                            {c.is_code_used ? 
                             <span className="text-[9px] text-stone-300 uppercase font-black">Code Used</span> : 
                             <span className="text-[9px] text-green-600 bg-green-50 px-2 py-0.5 rounded font-black uppercase tracking-tighter">Code Active</span>
                            }
                        </td>
                        <td className="p-4 text-right">
                          <a href={`tel:${c.phone_number}`} className="inline-block p-2 text-stone-400 hover:text-[#5B2C6F] transition">
                            <Phone size={18} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === "orders" && (
          <div className="animate-in fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <h1 className="text-2xl font-bold font-serif text-[#5B2C6F]">Orders Management</h1>
              <div className="flex bg-stone-100 p-1 rounded-sm gap-1">
                <button 
                  onClick={() => setOrderFilter('active')}
                  className={`px-4 py-1.5 text-[10px] font-bold uppercase transition-all ${orderFilter === 'active' ? 'bg-white text-[#5B2C6F] shadow-sm' : 'text-stone-400'}`}
                >
                  Active ({orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length})
                </button>
                <button 
                  onClick={() => setOrderFilter('history')}
                  className={`px-4 py-1.5 text-[10px] font-bold uppercase transition-all ${orderFilter === 'history' ? 'bg-white text-[#5B2C6F] shadow-sm' : 'text-stone-400'}`}
                >
                  History ({orders.filter(o => ['delivered', 'completed', 'cancelled'].includes(o.status)).length})
                </button>
              </div>
            </header>

            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-white border border-dashed border-stone-200 text-stone-300">
                  <Package className="mx-auto mb-2 opacity-20" size={40} />
                  <p className="text-xs uppercase tracking-widest font-bold">No orders found</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order.id} className="bg-white p-6 border border-stone-100 rounded-sm shadow-sm relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between border-b pb-4 mb-4 gap-4">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-[#5B2C6F]"><User size={20}/></div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-stone-800">{order.customer_name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <a href={`tel:${order.customer_phone}`} className="text-[10px] text-[#C5A059] font-bold hover:underline flex items-center gap-1">
                              <Phone size={10} /> {order.customer_phone || "No phone"}
                            </a>
                            <span className="text-stone-200 text-[10px]">|</span>
                            <span className="text-[10px] text-stone-400 font-mono">ID: #{order.order_number || order.id.slice(0,8)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <select 
                          className="text-[10px] border border-stone-200 p-1.5 rounded bg-stone-50 font-bold outline-none uppercase cursor-pointer"
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        {order.items?.map((it: any, i: number) => (
                          <div key={i} className="flex justify-between text-xs bg-stone-50/50 p-2 border border-stone-50">
                            <span className="text-stone-600 font-medium">{it.name} <b className="text-[#C5A059]">({it.size})</b></span>
                            <span className="font-bold">x{it.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-stone-400 uppercase font-black">Total Paid</p>
                        <p className="text-xl font-serif text-[#5B2C6F] font-bold">TZS {order.total_amount?.toLocaleString()}</p>
                        <p className="text-[9px] text-stone-400 font-bold mt-1 italic uppercase tracking-tighter">Via: {order.delivery_method}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL SECTION */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-sm shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
            <div className="bg-[#5B2C6F] p-4 flex justify-between items-center text-white">
              <span className="text-[10px] font-bold uppercase tracking-widest">{editMode ? "Edit Product" : "New Inventory Item"}</span>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div>
                   <label className="text-[9px] font-bold uppercase text-stone-400 block mb-1">Product Name</label>
                   <input type="text" required className="w-full p-2.5 border border-stone-100 bg-stone-50 outline-none text-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold uppercase text-stone-400 block mb-1">Category</label>
                    <select className="w-full p-2.5 border border-stone-100 bg-stone-50 outline-none text-sm uppercase font-bold text-[10px]" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                      <option value="perfumes">Perfumes</option>
                      <option value="soaps-bath">Soaps & Bath</option>
                      <option value="lotions-oils">Lotions & Oils</option>
                      <option value="home-fragrance">Home fragrance</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase text-[#C5A059] block mb-1">Target Gender</label>
                    <select className="w-full p-2.5 border border-[#C5A059]/30 bg-stone-50 outline-none text-sm uppercase font-bold text-[10px]" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                      <option value="unisex">Unisex</option>
                      <option value="male">For Him (Men)</option>
                      <option value="female">For Her (Women)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-100 space-y-4">
                  <p className="text-[8px] font-black uppercase tracking-widest text-[#5B2C6F]">Pricing Strategy</p>
                  
                  <div>
                      <label className="text-[9px] font-bold uppercase text-stone-400 block mb-1">Retail Price (TZS)</label>
                      <input type="number" required className="w-full p-2.5 border border-stone-200 bg-white outline-none text-sm font-mono" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                  </div>

                  {/* WHOLESALE INPUTS */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold uppercase text-[#C5A059] block mb-1">Wholesale Price</label>
                      <input type="number" placeholder="Optional" className="w-full p-2.5 border border-stone-200 bg-white outline-none text-sm font-mono" value={formData.wholesale_price} onChange={(e) => setFormData({...formData, wholesale_price: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase text-[#C5A059] block mb-1">Min Qty</label>
                      <input type="number" className="w-full p-2.5 border border-stone-200 bg-white outline-none text-sm font-mono" value={formData.wholesale_min_qty} onChange={(e) => setFormData({...formData, wholesale_min_qty: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div>
                   <label className="text-[9px] font-bold uppercase text-stone-400 block mb-1">Available Sizes</label>
                   <div className="grid grid-cols-3 gap-2">
                     <input type="text" placeholder="e.g 50ml" className="p-2 border border-stone-100 text-[10px] outline-none bg-stone-50" value={formData.size1} onChange={(e) => setFormData({...formData, size1: e.target.value})} />
                     <input type="text" placeholder="e.g 100ml" className="p-2 border border-stone-100 text-[10px] outline-none bg-stone-50" value={formData.size2} onChange={(e) => setFormData({...formData, size2: e.target.value})} />
                     <input type="text" placeholder="e.g 150ml" className="p-2 border border-stone-100 text-[10px] outline-none bg-stone-50" value={formData.size3} onChange={(e) => setFormData({...formData, size3: e.target.value})} />
                   </div>
                </div>
                <div>
                   <label className="text-[9px] font-bold uppercase text-stone-400 block mb-1">Product Image</label>
                   <input type="text" placeholder="Image URL (Automatic if upload)" className="w-full p-2.5 border border-stone-100 bg-stone-50 outline-none text-xs mb-2" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} />
                   <div className="relative border-2 border-dashed border-stone-100 p-4 text-center hover:bg-stone-50 transition cursor-pointer">
                     <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                     <div className="flex flex-col items-center gap-1">
                       <Upload size={16} className="text-stone-300"/>
                       <span className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">
                         {uploading ? "Uploading..." : "Click to Upload Image"}
                       </span>
                     </div>
                   </div>
                </div>
                <div>
                   <label className="text-[9px] font-bold uppercase text-stone-400 block mb-1">Description</label>
                   <textarea rows={3} className="w-full p-2.5 border border-stone-100 bg-stone-50 outline-none text-sm" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
                <button disabled={loading || uploading} className="w-full bg-[#5B2C6F] text-white py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-[#4A235A] transition-colors flex justify-center items-center gap-2">
                    {(loading || uploading) && <Loader2 size={14} className="animate-spin" />}
                    {loading ? "SAVING..." : "SAVE PRODUCT"}
                </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}