"use client";

import Navbar from "@/components/Navbar";
import { useCart } from "@/app/context/CartContext";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, CheckCircle, HelpCircle, X, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, subtotal } = useCart();
  const router = useRouter();
  
  // GHARAMA ZA ZIADA
  const deliveryFee = 3000; 
  const total = subtotal + deliveryFee;
  
  // STATE ZA MALIPO NA AUTH (Hii isLoggedIn baadaye itatoka kwenye Auth Context/Supabase)
  const [isLoggedIn] = useState(false); // Badilisha kuwa true ili kuona malipo moja kwa moja
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState("mpesa");

  // TAARIFA ZA BIASHARA
  const LIPA_NAMBA = "5566778"; 
  const BUSINESS_NAME = "LUNARA AROMATICS";
  const WHATSAPP_NUMBER = "255700000000"; 

  const paymentInstructions: any = {
    mpesa: [
      "Piga *150*00#",
      "Chagua 4 - Lipa kwa M-Pesa",
      "Chagua 1 - Lipa Namba",
      `Weka Namba ya Biashara: ${LIPA_NAMBA}`,
      `Weka Kiasi: TZS ${total.toLocaleString()}`,
      "Weka namba yako ya siri kuhakiki",
      "Bonyeza 1 Kuthibitisha"
    ],
    tigo: [
      "Piga *150*01#",
      "Chagua 5 - Lipa kwa Simu",
      "Chagua 2 - Kwa Lipa Namba",
      `Weka Lipa Namba: ${LIPA_NAMBA}`,
      `Weka Kiasi: TZS ${total.toLocaleString()}`,
      "Weka namba ya siri kuhakiki"
    ],
    airtel: [
      "Piga *150*60#",
      "Chagua 5 - Lipia Bili",
      "Chagua 1 - Lipa Namba",
      `Weka Lipa Namba: ${LIPA_NAMBA}`,
      `Weka Kiasi: TZS ${total.toLocaleString()}`,
      "Ingiza namba ya siri"
    ],
    halotel: [
      "Piga *150*88#",
      "Chagua 4 - Lipia Bili",
      "Chagua 3 - Lipa Namba",
      `Weka Lipa Namba: ${LIPA_NAMBA}`,
      `Weka Kiasi: TZS ${total.toLocaleString()}`,
      "Thibitisha muamala"
    ]
  };

  const handleProceedToPay = () => {
    if (!isLoggedIn) {
      toast.error("Tafadhali Login au Register kwanza ili uweze kukamilisha malipo na kupata punguzo la VIP.");
      setTimeout(() => {
        router.push("/login?redirect=cart");
      }, 2000);
    } else {
      setPaymentModalOpen(true);
    }
  };

  const sendWhatsAppMessage = (type: 'paid' | 'help') => {
    let message = type === 'paid' 
      ? `*ORDER MPYA (IMELIPIWA) ✅*\n\nHabari Lunara, nimeshalipia order yangu kupitia Lipa Namba.\n\n*Bidhaa:* \n`
      : `*MSAADA WA MALIPO ⚠️*\n\nHabari Lunara, nimekwama kufanya malipo. Naomba msaada kukamilisha order hii:\n\n*Bidhaa:* \n`;

    cartItems.forEach((item: any, index: number) => {
      message += `${index + 1}. ${item.name} (Size: ${item.size}) x ${item.quantity}\n`;
    });

    message += `\n*Jumla:* TZS ${total.toLocaleString()}`;
    if (type === 'paid') message += `\n\n*Jina la Mlipaji:* \n*Mahali pa kutuma:* `;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    setPaymentModalOpen(false);
  };

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#FCFCFC]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
          <div className="p-8 bg-stone-50 rounded-full">
            <ShoppingBag size={48} className="text-stone-300" />
          </div>
          <h1 className="text-2xl font-serif text-stone-800">Your bag is empty</h1>
          <p className="text-stone-500 text-sm">Discover your signature scent today.</p>
          <Link href="/categories">
            <button className="bg-[#5B2C6F] text-white px-10 py-4 rounded-sm hover:bg-[#4A235A] transition uppercase text-[10px] font-bold tracking-[0.2em] shadow-lg">
              Explore Collection
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FCFCFC]">
      <Navbar />
      
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <header className="mb-12">
          <h1 className="text-4xl font-serif text-[#5B2C6F]">Your Selection</h1>
          <div className="h-1 w-20 bg-[#C5A059] mt-4"></div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* ITEMS */}
          <div className="lg:col-span-2 space-y-10">
            {cartItems.map((item: any) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-8 group">
                <div className="relative w-32 h-40 bg-stone-100 overflow-hidden">
                  <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                
                <div className="flex-grow py-2 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest">{item.name}</h3>
                      <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-tighter italic">{item.size}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id, item.size)} className="text-stone-300 hover:text-red-400 transition">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-stone-200 rounded-full px-2">
                      <button onClick={() => updateQuantity(item.id, item.size, -1)} className="p-2 hover:text-[#C5A059]"><Minus size={12} /></button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.size, 1)} className="p-2 hover:text-[#C5A059]"><Plus size={12} /></button>
                    </div>
                    <p className="font-serif text-[#C5A059] text-lg font-medium">TZS {item.price.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white p-10 shadow-xl shadow-stone-200/50 border border-stone-50 rounded-sm sticky top-28">
              <h3 className="text-xs font-black text-stone-900 uppercase tracking-[0.3em] mb-8">Summary</h3>
              
              <div className="space-y-5 text-sm mb-10 border-b border-stone-100 pb-8">
                <div className="flex justify-between text-stone-500">
                  <span>Bag Subtotal</span>
                  <span>TZS {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Standard Delivery</span>
                  <span>TZS {deliveryFee.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-serif text-[#5B2C6F] mb-10">
                <span>Total Amount</span>
                <span>TZS {total.toLocaleString()}</span>
              </div>

              <button 
                onClick={handleProceedToPay}
                className="w-full bg-[#5B2C6F] text-white py-5 flex items-center justify-center gap-3 hover:bg-[#4A235A] transition shadow-2xl group"
              >
                {!isLoggedIn && <Lock size={14} className="text-[#C5A059]" />}
                <span className="uppercase text-[11px] font-bold tracking-[0.3em]">Proceed to Pay</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              {!isLoggedIn && (
                <p className="text-[10px] text-center mt-6 text-[#C5A059] font-bold uppercase tracking-widest">
                  Sign in to unlock payment
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {isPaymentModalOpen && isLoggedIn && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-900/80 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-md rounded-sm overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-[#5B2C6F] p-5 flex justify-between items-center text-white">
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Lipa Namba Payment</span>
              <button onClick={() => setPaymentModalOpen(false)}><X size={20} /></button>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <p className="text-[10px] uppercase text-stone-400 mb-2">Total Due</p>
                <p className="text-4xl font-serif text-[#C5A059]">TZS {total.toLocaleString()}</p>
                <div className="mt-4 p-2 bg-stone-50 border border-dashed border-stone-200 rounded">
                  <p className="text-xs font-bold text-stone-800 tracking-widest">{LIPA_NAMBA}</p>
                  <p className="text-[9px] uppercase text-stone-400">{BUSINESS_NAME}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-8">
                {['mpesa', 'tigo', 'airtel', 'halotel'].map((net) => (
                  <button
                    key={net}
                    onClick={() => setSelectedNetwork(net)}
                    className={`py-3 text-[9px] font-bold uppercase tracking-widest rounded transition-all border ${
                      selectedNetwork === net ? 'bg-[#5B2C6F] text-white border-[#5B2C6F]' : 'bg-white text-stone-400 border-stone-100 hover:border-stone-300'
                    }`}
                  >
                    {net}
                  </button>
                ))}
              </div>

              <div className="bg-stone-50 p-6 rounded mb-8">
                <ul className="space-y-3">
                  {paymentInstructions[selectedNetwork].map((step: string, i: number) => (
                    <li key={i} className="text-[11px] text-stone-600 flex gap-3">
                      <span className="text-[#C5A059] font-bold">{i + 1}.</span> {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-3">
                <button onClick={() => sendWhatsAppMessage('paid')} className="w-full bg-[#25D366] text-white py-4 rounded text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 shadow-lg">
                  <CheckCircle size={16} /> I have paid - send order
                </button>
                <button onClick={() => sendWhatsAppMessage('help')} className="w-full border border-stone-200 text-stone-500 py-3 rounded text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-stone-50">
                  <HelpCircle size={16} /> Need help?
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}