"use client";

import Navbar from "@/components/Navbar";
import { useCart } from "@/app/context/CartContext";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, CheckCircle, HelpCircle, X, Truck, Store, Copy, Ticket, Check, Sparkles, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/app/hooks/useTranslation";

// TAARIFA ZA MAWASILIANO NA BENKI
const LIPA_NAMBA = "59312165"; 
const BANK_ACCOUNT = {
  name: "Hamad Ally",
  account: "23310019298",
  bank: "NMB Bank"
};
const WHATSAPP_CONTACTS = [
  { id: 1, label: "WhatsApp 1 (Zantel)", number: "255777088040" },
  { id: 2, label: "WhatsApp 2 (Airtel)", number: "255688339466" }
];

export default function CartPage() {
  const supabase = createClient();
  const { cartItems, removeFromCart, updateQuantity, subtotal, setCartItems, clearCart } = useCart();
  const router = useRouter();
  const t = useTranslation();
  
  // STATES ZA USAFIRI NA DELIVERY
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('pickup'); // Nimeifanya pickup iwe default
  const [destination, setDestination] = useState("");
  const [transport, setTransport] = useState("Basi (Mikoani)");

  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState("mpesa");

  // State za User, Discount na WhatsApp Selection
  const [user, setUser] = useState<any>(null);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isApplying, setIsApplying] = useState(false);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState(WHATSAPP_CONTACTS[0].number);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  // 1. INITIALIZE DATA (User, Discount, Recommendations)
  useEffect(() => {
    const initializeData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('discount_code, is_code_used')
          .eq('id', authUser.id)
          .single();

        if (profile && !profile.is_code_used) {
          setDiscountCode(profile.discount_code);
        }
      }

      const savedCode = localStorage.getItem("appliedDiscountCode");
      const savedAmount = localStorage.getItem("appliedDiscountAmount");
      if (savedCode && savedAmount) {
        setDiscountAmount(parseInt(savedAmount));
      }

      const { data: products } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (products) {
        const uniqueProducts: any[] = [];
        const seenCategories = new Set();

        for (const product of products) {
          if (product.category && !seenCategories.has(product.category)) {
            seenCategories.add(product.category);
            uniqueProducts.push(product);
          }
          if (uniqueProducts.length === 4) break;
        }

        if (uniqueProducts.length < 4) {
          for (const product of products) {
            if (uniqueProducts.length === 4) break;
            if (!uniqueProducts.some(p => p.id === product.id)) {
              uniqueProducts.push(product);
            }
          }
        }
        setRecommendations(uniqueProducts);
      }
    };
    
    initializeData();
  }, [supabase]);

  // LIVE CALCULATION SYNC KWA DISCOUNT
  useEffect(() => {
    const savedAmount = localStorage.getItem("appliedDiscountAmount");
    if (savedAmount && subtotal > 0) {
      const newDiscountValue = Math.round(subtotal * 0.10); 
      setDiscountAmount(newDiscountValue);
      localStorage.setItem("appliedDiscountAmount", newDiscountValue.toString());
    }
  }, [subtotal]);

  const isNewProduct = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const applyDiscount = () => {
    if (isApplying) return;
    if (discountCode && discountAmount === 0) {
      setIsApplying(true);
      const discountValue = Math.round(subtotal * 0.10); 
      setDiscountAmount(discountValue);
      localStorage.setItem("appliedDiscountCode", discountCode);
      localStorage.setItem("appliedDiscountAmount", discountValue.toString());
      toast.success(t.discountApplied || "Discount Imekubaliwa!");
      setIsApplying(false);
    } else if (discountAmount > 0) {
      toast.info(t.discountAlreadyApplied || "Discount ishatumika!");
    }
  };

  // NIMEONDOA DELIVERY FEE HAPA, JUMLA NI BIDHAA PEKEE + DISCOUNT
  const total = Math.max(0, subtotal - discountAmount);

  const paymentInstructions: any = {
    mpesa: ["Piga *150*00#", "Chagua 4 (LIPA kwa M-Pesa)", "Chagua 1 (Lipa kwa simu)", "Chagua 1 (Ingiza lipa namba)", "Chagua 1 (Vodacom)", `Namba: ${LIPA_NAMBA}`, `Kiasi: ${total.toLocaleString()}`, "Weka Siri"],
    tigo: ["Piga *150*01#", "Chagua 5 (Lipa kwa simu)", "Chagua 2 (Lipa Namba)", `Namba: ${LIPA_NAMBA}`, `Kiasi: ${total.toLocaleString()}`, "Weka Siri"],
    airtel: ["Piga *150*60#", "Chagua 5 (Lipa bili)", "Chagua 1 (Lipa Namba)", `Namba: ${LIPA_NAMBA}`, `Kiasi: ${total.toLocaleString()}`, "Ingiza Siri"],
    halotel: ["Piga *150*88#", "Chagua 5 (Lipia bidhaa)", "Chagua 3 (M-pesa)","Ingiza lipa namba",`Namba: ${LIPA_NAMBA}`, `Kiasi: ${total.toLocaleString()}`,"Ingiza namba ya Siri"],
    nmb: ["Fungua NMB M-Plus App au Piga *150*66#", "Chagua (Transfer / Tuma Pesa)", "Chagua (To NMB Account)", `Ingiza: ${BANK_ACCOUNT.account}`, `Jina litatokea: ${BANK_ACCOUNT.name}`, `Kiasi: ${total.toLocaleString()}`, "Thibitisha na weka Siri"]
  };

  const handleProceedToPay = () => {
    if (!user) {
      toast.error("Please login or register to continue.");
      router.push("/login?returnUrl=/cart");
      return;
    }
    
    // KIZUIZI KAMA AMESAHAU KUJAZA NCHI NA MKOA WAKATI WA DELIVERY
    if (deliveryMethod === 'delivery' && destination.trim() === '') {
      toast.error("Tafadhali andika Nchi na Mkoa wako kwenye 'Taarifa za Usafiri' kabla ya kuendelea.");
      return;
    }

    setPaymentModalOpen(true);
  };

  const copyToClipboard = () => {
    const textToCopy = selectedNetwork === 'nmb' ? BANK_ACCOUNT.account : LIPA_NAMBA;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    toast.success("Copied successfully!");
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const sendWhatsAppMessage = async (type: 'paid' | 'help') => {
    const now = new Date();
    const orderRef = `LUN-${now.getDate()}${now.getMonth() + 1}-${Math.floor(100 + Math.random() * 900)}`;

    if (type === 'paid') {
      try {
        const { data: profile } = await supabase.from('profiles').select('phone_number, full_name').eq('id', user.id).single();
        
        const { error } = await supabase.from('orders').insert([{
          order_number: orderRef,
          user_id: user.id,
          customer_name: profile?.full_name || user.email,
          customer_phone: profile?.phone_number || "Namba haipo",
          items: cartItems,
          total_amount: total,
          // NAREKODI TAARIFA ZA DELIVERY KWENYE SUPABASE
          delivery_method: deliveryMethod === 'delivery' ? `Delivery: ${destination} (${transport})` : 'Pickup',
          status: 'pending'
        }]);

        if (error) throw error;
        if (discountAmount > 0) {
          await supabase.from('profiles').update({ is_code_used: true }).eq('id', user.id);
        }

        clearCart();
        localStorage.removeItem("appliedDiscountCode");
        localStorage.removeItem("appliedDiscountAmount");
        toast.success("Order recorded successfully!");
      } catch (err) {
        toast.error("Failed to record the order!");
        return;
      }
    }

    // ANDAA UJUMBE WA WHATSAPP
    let message = type === 'paid' 
      ? `*NEW ORDER #${orderRef} ✅*\n\n*Njia:* ${deliveryMethod === 'delivery' ? 'Kutumiwa (Delivery)' : 'Kuchukua Dukani (Store Pickup)'}\n`
      : `*PAYMENT HELP ORDER #${orderRef} ⚠️*\n\nNaomba msaada wa order hii:\n`;

    // TAARIFA ZA ENEO (KAMA NI DELIVERY)
    if (deliveryMethod === 'delivery' && type === 'paid') {
      message += `*📍 Eneo (Nchi & Mkoa):* ${destination}\n`;
      message += `*🚚 Usafiri:* ${transport}\n\n`;
    }

    if (discountAmount > 0) message += `*DISCOUNT:* 10% OFF (-TZS ${discountAmount.toLocaleString()})\n`;
    
    message += `\n*Bidhaa:* \n`;
    cartItems.forEach((item: any, index: number) => {
      message += `${index + 1}. ${item.name} (${item.size}) x ${item.quantity} - TZS ${(item.price * item.quantity).toLocaleString()}\n`;
    });

    message += `\n*JUMLA KUU (Bidhaa):* TZS ${total.toLocaleString()}`;

    // MANENO YA KUMALIZIA WHATSAPP
    if (type === 'paid') {
      if (deliveryMethod === 'delivery') {
        message += `\n\n_Nimeshaona namba za malipo kwenye website, naomba unipe hesabu ya nauli ya usafiri ili nikamilishe malipo yote._`;
      } else {
        message += `\n\n_Nitakuja kuchukua mzigo wangu na kufanya malipo dukani._`;
      }
      message += `\n\n_(Kama umeshalipia, tafadhali ambatanisha screenshot ya muamala wako hapa)_`;
    }
    
    window.open(`https://wa.me/${selectedWhatsApp}?text=${encodeURIComponent(message)}`, '_blank');
    setPaymentModalOpen(false);
  };

  // =====================================
  // EMPTY CART STATE
  // =====================================
  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-6 py-20 flex flex-col items-center">
          <ShoppingBag size={50} className="text-stone-100 mb-4" />
          <h2 className="text-xl font-serif text-[#5B2C6F] uppercase tracking-tighter mb-8">{t.noItemsInBag || "Kapu lako ni tupu"}</h2>
          <Link href="/shop" className="bg-[#5B2C6F] text-white px-10 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition mb-20">{t.exploreShopBtn || "Endelea Kununua"}</Link>

          <div className="w-full max-w-5xl border-t pt-10">
            <h3 className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-10 text-stone-400">
              <Sparkles size={12} /> {t.newArrivalsForYou || "Bidhaa Mpya"}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendations.map((item) => {
                const catSlug = item.category ? item.category.toLowerCase().replace(/ /g, '-') : "all";
                return (
                  <Link key={item.id} href={`/categories/${catSlug}?productId=${item.id}`} className="group relative">
                    <div className="aspect-[3/4] bg-stone-50 mb-3 overflow-hidden relative">
                      <Image src={item.image_url || (item.images && item.images[0])} alt={item.name} fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                      {isNewProduct(item.created_at) && (
                        <div className="absolute top-2 left-2 bg-black text-white text-[8px] font-bold px-2 py-1 uppercase">New</div>
                      )}
                    </div>
                    <h4 className="text-[10px] font-bold uppercase truncate">{item.name}</h4>
                    <p className="text-[10px] text-stone-500 mt-1">TZS {item.price.toLocaleString()}</p>
                    <p className="text-[8px] text-[#C5A059] font-bold uppercase mt-1 italic">View in {item.category}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =====================================
  // ACTIVE CART STATE
  // =====================================
  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Navbar />
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <header className="mb-10">
          <h1 className="text-3xl font-serif text-[#5B2C6F] uppercase tracking-widest">Shopping Bag</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* ITEMS LIST */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item: any) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-4 bg-white p-4 border border-stone-100 shadow-sm rounded-sm">
                <div className="relative w-24 h-28 bg-stone-50 shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xs font-bold text-stone-900 uppercase">{item.name}</h3>
                      <p className="text-[9px] text-[#5B2C6F] font-bold mt-1 uppercase">Size: {item.size}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id, item.size)} className="text-stone-300 hover:text-red-400 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center border border-stone-200 rounded-sm">
                      <button onClick={() => updateQuantity(item.id, item.size, -1)} className="p-1.5 hover:bg-stone-50"><Minus size={10} /></button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.size, 1)} className="p-1.5 hover:bg-stone-50"><Plus size={10} /></button>
                    </div>
                    <p className="text-sm font-bold text-[#C5A059]">TZS {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 border border-stone-100 shadow-xl rounded-sm sticky top-24">
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 pb-2 border-b">Order Summary</h3>
              
              {/* DISCOUNT WIDGET */}
              {discountCode && discountAmount === 0 && (
                <div className="bg-green-50 border border-green-100 p-3 mb-6 rounded-sm flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-bold text-green-700 uppercase flex items-center gap-1"><Ticket size={10}/> Member Offer</p>
                    <p className="text-[10px] text-green-600">Code: <b>{discountCode}</b></p>
                  </div>
                  <button onClick={applyDiscount} disabled={isApplying} className="bg-green-600 text-white text-[9px] px-3 py-1 font-bold rounded-sm uppercase tracking-wider hover:bg-green-700">
                    {isApplying ? "..." : "Apply"}
                  </button>
                </div>
              )}

              {/* DELIVERY OPTIONS */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button onClick={() => setDeliveryMethod('pickup')} className={`py-3 text-[9px] font-bold uppercase flex flex-col items-center gap-1 border rounded-sm transition-all ${deliveryMethod === 'pickup' ? 'border-[#5B2C6F] bg-[#5B2C6F]/5 text-[#5B2C6F]' : 'border-stone-100 text-stone-400'}`}>
                  <Store size={14} /> Pickup
                </button>
                <button onClick={() => setDeliveryMethod('delivery')} className={`py-3 text-[9px] font-bold uppercase flex flex-col items-center gap-1 border rounded-sm transition-all ${deliveryMethod === 'delivery' ? 'border-[#5B2C6F] bg-[#5B2C6F]/5 text-[#5B2C6F]' : 'border-stone-100 text-stone-400'}`}>
                  <Truck size={14} /> Delivery
                </button>
              </div>

              {/* TEXTBOX YA DELIVERY */}
              {deliveryMethod === 'delivery' && (
                <div className="space-y-3 mb-6 bg-stone-50 p-4 border border-stone-100 rounded-sm">
                  <div>
                    <label className="text-[9px] font-bold text-stone-500 flex items-center gap-1 uppercase"><MapPin size={10} /> 1. Nchi & Mkoa</label>
                    <input 
                      type="text" 
                      placeholder="Mfano: Tanzania, Mwanza"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full mt-1 bg-white border border-stone-200 p-2 text-[10px] outline-none focus:border-[#5B2C6F]"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-stone-500 uppercase">2. Njia ya Usafiri</label>
                    <select 
                      value={transport}
                      onChange={(e) => setTransport(e.target.value)}
                      className="w-full mt-1 bg-white border border-stone-200 p-2 text-[10px] outline-none focus:border-[#5B2C6F]"
                    >
                      <option value="Basi (Mikoani)">Basi (Mikoani)</option>
                      <option value="Bodaboda / Mkononi">Bodaboda (Ndani ya Mkoa)</option>
                      <option value="Boti / Meli">Boti / Meli</option>
                      <option value="Ndege (Posta/EMS)">Ndege (Posta/EMS)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TOTALS */}
              <div className="space-y-4 text-xs mb-6 text-stone-500">
                <div className="flex justify-between"><span>Subtotal</span><span>TZS {subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-[#C5A059] font-bold">
                  <span>Transport</span>
                  <span>{deliveryMethod === 'delivery' ? 'Gharama Baadaye' : 'FREE'}</span>
                </div>
                {discountAmount > 0 && <div className="flex justify-between text-green-600 font-bold bg-green-50/50 p-1"><span>Discount (10%)</span><span>- TZS {discountAmount.toLocaleString()}</span></div>}
                <div className="h-[1px] bg-stone-100"></div>
                <div className="flex justify-between text-lg font-serif text-[#5B2C6F]"><span>Total</span><span className="font-sans font-bold">TZS {total.toLocaleString()}</span></div>
              </div>

              <button onClick={handleProceedToPay} className="w-full bg-[#5B2C6F] text-white py-4 flex items-center justify-center gap-3 uppercase text-[10px] font-bold tracking-widest hover:bg-[#4A235A] transition shadow-lg">
                Proceed to Pay <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================== */}
      {/* PAYMENT MODAL (STEP BY STEP)          */}
      {/* ===================================== */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-sm shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-[#5B2C6F] p-4 flex justify-between items-center text-white">
              <span className="text-[10px] font-bold uppercase tracking-widest">Select Payment Method</span>
              <button onClick={() => setPaymentModalOpen(false)}><X size={18} /></button>
            </div>

            <div className="p-5">
              <div className="text-center mb-4 bg-stone-50 p-3 rounded relative">
                <p className="text-[10px] uppercase text-stone-400 mb-1">Total Due (Bidhaa tu)</p>
                <p className="text-2xl font-bold text-[#5B2C6F]">TZS {total.toLocaleString()}</p>
                
                <div className="mt-2 pt-2 border-t border-stone-200 flex items-center justify-between">
                  <p className="text-[10px] font-black text-stone-800 tracking-wider uppercase">
                    {selectedNetwork === 'nmb' ? `A/C: ${BANK_ACCOUNT.account}` : `Lipa Namba: ${LIPA_NAMBA}`}
                  </p>
                  <button onClick={copyToClipboard} className="p-1 hover:bg-stone-200 rounded transition">
                    {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-[#C5A059]"/>}
                  </button>
                </div>
              </div>

              {/* WARNING KWA WALIOCHAGUA DELIVERY */}
              {deliveryMethod === 'delivery' && (
                <div className="bg-yellow-50 border border-yellow-200 p-2 rounded-sm mb-4">
                  <p className="text-[9px] text-yellow-800 text-center font-bold">
                    ⚠️ Usafiri haujajumuishwa hapo juu. Omba hesabu ya nauli WhatsApp.
                  </p>
                </div>
              )}

              {/* PAYMENT NETWORK GRID */}
              <div className="grid grid-cols-5 gap-1 mb-4">
                {['mpesa', 'tigo', 'airtel', 'halotel', 'nmb'].map((net) => (
                  <button 
                    key={net} 
                    onClick={() => setSelectedNetwork(net)} 
                    className={`py-2 text-[8px] font-bold uppercase rounded-sm border transition-colors ${selectedNetwork === net ? 'bg-[#5B2C6F] text-white' : 'text-stone-400 border-stone-100 hover:bg-stone-50'}`}
                  >
                    {net === 'nmb' ? 'NMB' : net}
                  </button>
                ))}
              </div>

              {/* PAYMENT INSTRUCTIONS */}
              <div className="bg-stone-50 p-3 rounded-sm mb-4 border-l-2 border-[#C5A059] max-h-40 overflow-y-auto">
                <p className="text-[8px] font-bold uppercase mb-2 text-stone-400">Step by Step:</p>
                <ul className="space-y-1">
                  {paymentInstructions[selectedNetwork]?.map((step: string, i: number) => (
                    <li key={i} className="text-[9px] text-stone-600 flex gap-2">
                      <span className="font-bold text-[#5B2C6F]">{i + 1}.</span> {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-5">
                <p className="text-[9px] uppercase text-stone-400 mb-2 font-bold tracking-tight">Tuma ushahidi WhatsApp:</p>
                <div className="grid grid-cols-1 gap-2">
                  {WHATSAPP_CONTACTS.map((contact) => (
                    <button key={contact.id} onClick={() => setSelectedWhatsApp(contact.number)} className={`flex items-center justify-between px-3 py-2 border rounded-sm transition-all ${selectedWhatsApp === contact.number ? 'border-[#25D366] bg-[#25D366]/5 text-[#25D366]' : 'border-stone-100 text-stone-400'}`}>
                      <span className="text-[10px] font-bold uppercase">{contact.label}</span>
                      {selectedWhatsApp === contact.number && <CheckCircle size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <button onClick={() => sendWhatsAppMessage('paid')} className="w-full bg-[#25D366] text-white py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#1ebd5b] transition">
                  <CheckCircle size={14} /> Send Order via WhatsApp
                </button>
                <button onClick={() => sendWhatsAppMessage('help')} className="w-full border border-stone-100 text-stone-400 py-2 rounded-sm text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-stone-50 transition">
                  <HelpCircle size={12} /> Need Help?
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}