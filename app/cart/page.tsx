"use client";

import Navbar from "@/components/Navbar";
import { useCart } from "@/app/context/CartContext";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, CheckCircle, HelpCircle, X, Truck, Store, Copy, Ticket } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CartPage() {
  const supabase = createClient();
  const { cartItems, removeFromCart, updateQuantity, subtotal, setCartItems } = useCart();
  const router = useRouter();
  
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState("mpesa");

  // State za User na Discount
  const [user, setUser] = useState<any>(null);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isApplying, setIsApplying] = useState(false);

  // TAARIFA ZA MALIPO (Badilisha hapa)
  const LIPA_NAMBA = "5566778"; 
  const WHATSAPP_NUMBER = "255700000000"; 

  useEffect(() => {
    const checkUser = async () => {
      // Angalia kama discount tayari imeshatumika katika session hii
      const appliedDiscountCode = localStorage.getItem("appliedDiscountCode");
      const appliedDiscountAmount = localStorage.getItem("appliedDiscountAmount");
      
      if (appliedDiscountCode && appliedDiscountAmount) {
        setDiscountCode(appliedDiscountCode);
        setDiscountAmount(parseInt(appliedDiscountAmount));
        return; // Usije kuendelea na fetching
      }

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('discount_code, is_code_used')
          .eq('id', user.id)
          .single();

        // Onyesha code tu kama haijatumiwa bado
        if (profile && !profile.is_code_used) {
          setDiscountCode(profile.discount_code);
        }
      }
    };
    checkUser();
  }, [supabase]);

  const applyDiscount = () => {
    if (isApplying) return;
    
    if (discountCode && discountAmount === 0) {
      setIsApplying(true);
      // Piga hesabu ya 10% ya subtotal
      const discountValue = Math.round(subtotal * 0.10); 
      setDiscountAmount(discountValue);
      
      // Hifadhi discount katika localStorage ili isije tena
      localStorage.setItem("appliedDiscountCode", discountCode);
      localStorage.setItem("appliedDiscountAmount", discountValue.toString());
      
      toast.success("Hongera! Punguzo la 10% limekubaliwa.");
      setIsApplying(false);
    } else if (discountAmount > 0) {
      toast.info("Punguzo tayari limeshatumika.");
    }
  };

  const deliveryFee = deliveryMethod === 'delivery' ? 3000 : 0;
  // Hakikisha total haiwi hasi (negative)
  const total = Math.max(0, subtotal + deliveryFee - discountAmount);

  const paymentInstructions: any = {
    mpesa: ["Piga *150*00#", "Chagua 4 (Lipa)", "Chagua 1 (Lipa Namba)", `Namba: ${LIPA_NAMBA}`, `Kiasi: ${total.toLocaleString()}`, "Weka Siri"],
    tigo: ["Piga *150*01#", "Chagua 5 (Lipa)", "Chagua 2 (Lipa Namba)", `Namba: ${LIPA_NAMBA}`, `Kiasi: ${total.toLocaleString()}`, "Weka Siri"],
    airtel: ["Piga *150*60#", "Chagua 5 (Bili)", "Chagua 1 (Lipa Namba)", `Namba: ${LIPA_NAMBA}`, `Kiasi: ${total.toLocaleString()}`, "Ingiza Siri"],
    halotel: ["Piga *150*88#", "Chagua 4 (Bili)", "Chagua 3 (Lipa Namba)", `Namba: ${LIPA_NAMBA}`, `Kiasi: ${total.toLocaleString()}`, "Thibitisha"]
  };

  const handleProceedToPay = () => {
    if (!user) {
      toast.error("Tafadhali Ingia au Jisajili ili uendelee.");
      router.push("/login?returnUrl=/cart");
    } else {
      setPaymentModalOpen(true);
    }
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(LIPA_NAMBA);
      toast.success("Namba imekopiwa!");
  };

  const sendWhatsAppMessage = async (type: 'paid' | 'help') => {
    if (type === 'paid') {
      try {
        // 1. Pata namba ya simu ya mteja
        const { data: profileData } = await supabase
          .from('profiles')
          .select('phone_number')
          .eq('id', user.id)
          .single();

        // 2. Hifadhi oda kwenye Database
        const { error: orderError } = await supabase
          .from('orders')
          .insert([
            {
              user_id: user.id,
              customer_name: user.email?.split('@')[0] || "Mteja",
              customer_phone: profileData?.phone_number || "Namba haipo",
              items: cartItems,
              total_amount: total,
              delivery_method: deliveryMethod,
              status: 'pending'
            }
          ]);

        if (orderError) throw orderError;

        // 3. Zima kodi isitumike tena kama mteja amepata punguzo
        if (discountAmount > 0) {
          await supabase
            .from('profiles')
            .update({ is_code_used: true })
            .eq('id', user.id);
        }

        // 4. Safisha kila kitu
        if (typeof setCartItems === 'function') {
            setCartItems([]);
            localStorage.removeItem("cart");
            localStorage.removeItem("appliedDiscountCode");
            localStorage.removeItem("appliedDiscountAmount");
        }
        
        toast.success("Oda yako imerekodiwa kikamilifu!");

      } catch (err: any) {
        console.error("Order Error:", err.message);
        toast.error("Imeshindwa kuhifadhi oda. Jaribu tena.");
        return;
      }
    }

    // 5. Tengeneza Meseji ya WhatsApp
    let message = type === 'paid' 
      ? `*ORDER MPYA (MALIPO) ✅*\n\nNjia: ${deliveryMethod === 'delivery' ? 'Delivery' : 'Store Pickup'}\n`
      : `*MSAADA WA MALIPO ⚠️*\n\nNaomba msaada wa order hii:\n`;

    if (discountAmount > 0) {
      message += `*DISCOUNT:* 10% OFF (-TZS ${discountAmount.toLocaleString()})\n`;
    }
    
    message += `\n*Bidhaa:* \n`;
    cartItems.forEach((item: any, index: number) => {
      message += `${index + 1}. ${item.name} (${item.size}) x ${item.quantity} - TZS ${(item.price * item.quantity).toLocaleString()}\n`;
    });

    if (deliveryFee > 0) message += `*Delivery Fee:* TZS ${deliveryFee.toLocaleString()}\n`;
    message += `\n*JUMLA KUU:* TZS ${total.toLocaleString()}`;
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    setPaymentModalOpen(false);
  };

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
          <ShoppingBag size={48} className="text-stone-200" />
          <h1 className="text-2xl font-serif text-[#5B2C6F]">Bag yako haina kitu</h1>
          <Link href="/shop" className="bg-[#5B2C6F] text-white px-8 py-3 uppercase text-[10px] font-bold tracking-widest">Explore Shop</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <Navbar />
      
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <header className="mb-10 text-center lg:text-left">
          <h1 className="text-3xl font-serif text-[#5B2C6F] uppercase tracking-widest">Shopping Bag</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* LIST YA BIDHAA */}
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
              
              {/* Box la Discount Code (Inatokea tu kama mteja anayo code na bado haja-apply) */}
              {discountCode && discountAmount === 0 && (
                <div className="bg-green-50 border border-green-100 p-3 mb-6 rounded-sm flex justify-between items-center animate-pulse">
                    <div>
                      <p className="text-[9px] font-bold text-green-700 uppercase flex items-center gap-1">
                        <Ticket size={10}/> New Member Offer
                      </p>
                      <p className="text-[10px] text-green-600">Code: <b>{discountCode}</b></p>
                    </div>
                    <button 
                      onClick={applyDiscount} 
                      disabled={isApplying}
                      className="bg-green-600 text-white text-[9px] px-3 py-1 font-bold rounded-sm uppercase tracking-wider hover:bg-green-700 disabled:opacity-50"
                    >
                      {isApplying ? "..." : "Apply"}
                    </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mb-6">
                <button 
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`py-3 text-[9px] font-bold uppercase flex flex-col items-center gap-1 border rounded-sm transition-all ${deliveryMethod === 'delivery' ? 'border-[#5B2C6F] bg-[#5B2C6F]/5 text-[#5B2C6F]' : 'border-stone-100 text-stone-400'}`}
                >
                  <Truck size={14} /> Delivery
                </button>
                <button 
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`py-3 text-[9px] font-bold uppercase flex flex-col items-center gap-1 border rounded-sm transition-all ${deliveryMethod === 'pickup' ? 'border-[#5B2C6F] bg-[#5B2C6F]/5 text-[#5B2C6F]' : 'border-stone-100 text-stone-400'}`}
                >
                  <Store size={14} /> Pickup
                </button>
              </div>

              <div className="space-y-4 text-xs mb-6 text-stone-500">
                <div className="flex justify-between"><span>Subtotal</span><span>TZS {subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between">
                  <span>{deliveryMethod === 'delivery' ? 'Delivery Fee' : 'Store Pickup'}</span>
                  <span>{deliveryMethod === 'delivery' ? `TZS ${deliveryFee.toLocaleString()}` : 'FREE'}</span>
                </div>
                
                {discountAmount > 0 && (
                   <div className="flex justify-between text-green-600 font-bold bg-green-50/50 p-1">
                     <span>Discount (10%)</span>
                     <span>- TZS {discountAmount.toLocaleString()}</span>
                   </div>
                )}

                <div className="h-[1px] bg-stone-100"></div>
                <div className="flex justify-between text-lg font-serif text-[#5B2C6F]">
                  <span>Total</span><span className="font-sans font-bold">TZS {total.toLocaleString()}</span>
                </div>
              </div>

              <button onClick={handleProceedToPay} className="w-full bg-[#5B2C6F] text-white py-4 flex items-center justify-center gap-3 uppercase text-[10px] font-bold tracking-widest hover:bg-[#4A235A] transition shadow-lg">
                Proceed to Pay <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#5B2C6F] p-4 flex justify-between items-center text-white">
              <span className="text-[10px] font-bold uppercase tracking-widest">Lipa Namba Payment</span>
              <button onClick={() => setPaymentModalOpen(false)}><X size={18} /></button>
            </div>

            <div className="p-5">
              <div className="text-center mb-4 bg-stone-50 p-3 rounded">
                <p className="text-[10px] uppercase text-stone-400 mb-1">Total Due</p>
                <p className="text-2xl font-bold text-[#5B2C6F]">TZS {total.toLocaleString()}</p>
                <div className="mt-2 pt-2 border-t border-stone-200 flex items-center justify-between">
                  <p className="text-[10px] font-black text-stone-800 tracking-wider uppercase">Lipa Namba: {LIPA_NAMBA}</p>
                  <button onClick={copyToClipboard} className="p-1 hover:bg-stone-200 rounded transition"><Copy size={14} className="text-[#C5A059]"/></button>
                </div>
              </div>

              {/* NETWORK SELECTOR */}
              <div className="grid grid-cols-4 gap-1 mb-4">
                  {['mpesa', 'tigo', 'airtel', 'halotel'].map((net) => (
                    <button 
                      key={net} 
                      onClick={() => setSelectedNetwork(net)} 
                      className={`py-2 text-[8px] font-bold uppercase rounded-sm border transition-colors ${selectedNetwork === net ? 'bg-[#5B2C6F] text-white' : 'text-stone-400 border-stone-100 hover:bg-stone-50'}`}
                    >
                      {net}
                    </button>
                  ))}
              </div>

              {/* MAELEKEZO YA USSD */}
              <div className="bg-stone-50 p-4 rounded-sm mb-5 border-l-2 border-[#C5A059]">
                <ul className="space-y-1">
                  {paymentInstructions[selectedNetwork].map((step: string, i: number) => (
                    <li key={i} className="text-[10px] text-stone-600 leading-tight">
                      <span className="text-[#5B2C6F] font-bold">{i + 1}.</span> {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <button onClick={() => sendWhatsAppMessage('paid')} className="w-full bg-[#25D366] text-white py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#1ebd5b] transition">
                  <CheckCircle size={14} /> I Have Paid
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