"use client";
import { useState, useEffect } from "react";
import { Search, ShoppingBag, Globe, X, ArrowRight, User, LogOut, LayoutDashboard, Package } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/app/data/translations";
import { allProducts } from "@/app/data/products";
import Link from "next/link";
import Image from "next/image";
import DiscountModal from "@/components/DiscountModal";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
const supabase = createClient();
import { toast } from "sonner";

export default function Navbar() {
  const { cartCount } = useCart();
  const { lang, setLang } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [hasOrderUpdate, setHasOrderUpdate] = useState(false);
  const ADMIN_EMAIL = "admin@lunara.com"; 

  const t = translations[lang];

  // 1. Kazi ya kucheki oda (Inatumika mara ya kwanza mteja anapoingia)
  const checkOrderNotifications = async (userId: string) => {
    const { data } = await supabase
      .from("orders")
      .select("status")
      .eq("user_id", userId)
      .in("status", ["processing", "shipped", "delivered", "cancelled", "completed"]);

    if (data && data.length > 0) {
      setHasOrderUpdate(true);
    }
  };

  useEffect(() => {
    // Pata User wa sasa
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        checkOrderNotifications(user.id);
        setupRealtimeSubscription(user.id);
      }
    };
    getUser();

    // 2. REALTIME SUBSCRIPTION NDANI YA NAVBAR
    // Hii inamfanya mteja aone dot nyekundu hata akiwa kwenye Home Page
    let channelRef: any = null;
    const setupRealtimeSubscription = (userId: string) => {
      const chan = supabase
        .channel(`navbar_updates_${userId}`)
        .on(
          'postgres_changes',
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'orders',
            filter: `user_id=eq.${userId}` 
          },
          (payload: any) => {
            // Show notification/badge when an order's status changes
            if (payload.new && payload.old && payload.new.status !== payload.old.status) {
              setHasOrderUpdate(true);
              toast.info("Oda yako imefanyiwa mabadiliko! Angalia 'My Orders'.", {
                icon: <Package className="text-[#5B2C6F]" size={16} />,
              });
            }
          }
        )
        .subscribe();

      channelRef = chan;
      return chan;
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        checkOrderNotifications(currentUser.id);
        setupRealtimeSubscription(currentUser.id);
      }
    });

    return () => {
      // Cleanup auth listener
      try {
        authListener.subscription.unsubscribe();
      } catch (e) {
        // ignore
      }
      // Remove realtime channel if created
      try {
        if (channelRef) supabase.removeChannel(channelRef);
      } catch (e) {
        // ignore
      }
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    const filtered = allProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered.slice(0, 5));
  }, [searchQuery]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return (
    <>
      <DiscountModal />

      <nav className="sticky top-0 z-[100] bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* LOGO SECTION */}
          <Link href="/" className="relative w-40 md:w-60 h-12 md:h-18 flex items-center justify-start group">
            <Image 
              src="/logo.png" 
              alt="Lunara Aromatics" 
              fill 
              className="object-contain transition-transform duration-500 group-hover:scale-105"
              priority 
            />
          </Link>

          {/* CENTER MENU */}
          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">
            <Link href="/" className="hover:text-[#5B2C6F] transition">{t.home}</Link>
            <Link href="/categories" className="hover:text-[#5B2C6F] transition">{t.categories}</Link>
            <Link href="/about" className="hover:text-[#5B2C6F] transition">{t.about}</Link>
            <Link href="/contact" className="hover:text-[#5B2C6F] transition">{t.contact}</Link>
            
            {user?.email === ADMIN_EMAIL && (
              <Link href="/admin" className="text-[#C5A059] flex items-center gap-1 border-b border-[#C5A059]">
                <LayoutDashboard size={12} /> Dashboard
              </Link>
            )}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3 md:gap-5">
            <button onClick={() => setIsSearchOpen(true)} className="hover:text-[#C5A059] transition">
              <Search size={20} />
            </button>

            <button 
              onClick={() => setLang(lang === "en" ? "sw" : "en")}
              className="hidden sm:flex items-center gap-1 text-[10px] font-bold border border-stone-200 px-2 py-1 rounded hover:bg-stone-50 transition"
            >
              <Globe size={12} />
              {lang === "en" ? "EN" : "SW"}
            </button>

            {!user ? (
              <Link href="/login" className="hover:text-[#5B2C6F] transition">
                <User size={22} />
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link 
                  href="/orders" 
                  onClick={() => setHasOrderUpdate(false)}
                  className="relative flex items-center gap-1 text-[10px] font-bold text-stone-600 hover:text-[#5B2C6F] transition border-r pr-4 border-stone-100"
                >
                  <Package size={16} />
                  <span className="hidden lg:inline uppercase tracking-widest">Orders</span>
                  {hasOrderUpdate && (
                    <span className="absolute -top-1 right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </Link>

                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[8px] text-stone-400 uppercase font-black tracking-widest">Account</span>
                  <span className="text-[10px] font-bold text-[#5B2C6F] truncate max-w-[80px] uppercase">{user.email.split('@')[0]}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-stone-300 hover:text-red-500 transition"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}

            <Link href="/cart" className="relative group">
              <ShoppingBag size={22} className="group-hover:text-[#5B2C6F] transition" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#C5A059] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* SEARCH OVERLAY - Inabaki vilevile */}
        {isSearchOpen && (
          <div className="absolute top-0 left-0 w-full bg-white shadow-2xl animate-in slide-in-from-top duration-300 z-[110]">
            <div className="container mx-auto px-6 py-8">
              <div className="flex items-center border-b-2 border-[#5B2C6F] pb-2">
                <input 
                  autoFocus
                  type="text" 
                  placeholder={t.search}
                  className="w-full text-2xl font-serif outline-none placeholder:text-stone-200 uppercase tracking-tighter"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={() => {setIsSearchOpen(false); setSearchQuery("");}}>
                  <X size={28} className="text-gray-400 hover:text-black" />
                </button>
              </div>

              {searchQuery && (
                <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map(product => (
                      <Link 
                        key={product.id} 
                        href={`/shop/${product.id}`}
                        onClick={() => {setIsSearchOpen(false); setSearchQuery("");}}
                        className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-md transition"
                      >
                        <div className="relative w-16 h-16 shrink-0 bg-stone-50">
                          <Image src={product.image} alt={product.name} fill className="object-contain p-1" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-xs font-bold text-stone-800 uppercase tracking-widest">{product.name}</h4>
                          <p className="text-[10px] text-[#C5A059] font-black">TZS {product.price.toLocaleString()}</p>
                        </div>
                        <ArrowRight size={14} className="text-stone-200" />
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 uppercase tracking-widest py-4">{t.noResults}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}