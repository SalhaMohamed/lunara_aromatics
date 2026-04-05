"use client";
import { useState, useEffect } from "react";
import { Search, ShoppingBag, Globe, X, ArrowRight, User, LogOut, LayoutDashboard, Package } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/app/data/translations";
import Link from "next/link";
import Image from "next/image";
import DiscountModal from "@/components/DiscountModal";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const supabase = createClient();

export default function Navbar() {
  const { cartCount } = useCart();
  const { lang, setLang } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // Tumeongeza state ya role
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [hasOrderUpdate, setHasOrderUpdate] = useState(false);

  const t = translations[lang];

  // 1. REAL-TIME SEARCH LOGIC
  useEffect(() => {
    const fetchQuickSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url, category')
        .ilike('name', `%${searchQuery}%`)
        .limit(5);

      if (!error && data) {
        setSearchResults(data);
      }
    };

    const debounceTimer = setTimeout(fetchQuickSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim() !== "") {
      setIsSearchOpen(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  // 2. AUTH LOGIC (IMEBORESHWA)
  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Pata Role kutoka Metadata
        setUserRole(user.user_metadata?.role || null);
        
        try {
          const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
          if (profile?.full_name) setDisplayName(profile.full_name);
        } catch (e) {}
      } else {
        setUserRole(null);
      }
    };
    
    getUserData();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setUserRole(session?.user?.user_metadata?.role ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    toast.success(lang === "en" ? "Logged out" : "Umetoka");
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <DiscountModal />

      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* LOGO SECTION */}
          <Link href="/" className="relative w-56 md:w-72 h-16 flex items-center group" title={t.home || "Home"}>
            <Image 
              src="/logo.png" 
              alt="Bahmad Perfumes" 
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
            
            {/* DASHBOARD SASA INATEGEMEA ROLE BADALA YA EMAIL */}
            {userRole === 'admin' && (
              <Link href="/admin" className="text-[#C5A059] flex items-center gap-1 border-b border-[#C5A059]" title="Admin Dashboard">
                <LayoutDashboard size={12} /> {lang === "en" ? "Dashboard" : "Dashibodi"}
              </Link>
            )}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* SEARCH */}
            <button 
              onClick={() => setIsSearchOpen(true)} 
              className="hover:text-[#C5A059] transition p-2"
              title={lang === "en" ? "Search Products" : "Tafuta Bidhaa"}
            >
              <Search size={20} />
            </button>

            {/* LANGUAGE TOGGLE */}
            <button 
              onClick={() => setLang(lang === "en" ? "sw" : "en")}
              className="flex items-center gap-1 text-[10px] font-bold border border-stone-200 px-2 py-1 rounded hover:bg-stone-50 transition"
              title={lang === "en" ? "Switch to Swahili" : "Badili kwenda Kiingereza"}
            >
              <Globe size={12} />
              {lang === "en" ? "EN" : "SW"}
            </button>

            {!user ? (
              <Link 
                href="/login" 
                className="hover:text-[#5B2C6F] transition p-2"
                title={lang === "en" ? "Login / Register" : "Ingia / Jisajili"}
              >
                <User size={22} />
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link 
                  href="/orders" 
                  className="relative flex items-center gap-1 text-[10px] font-bold text-stone-600 hover:text-[#5B2C6F] transition border-r pr-4 border-stone-100"
                  title={lang === "en" ? "My Orders" : "Oda Zangu"}
                >
                  <Package size={16} />
                  {hasOrderUpdate && <span className="absolute top-0 right-3 h-2 w-2 rounded-full bg-red-500 border-2 border-white animate-pulse"></span>}
                </Link>

                <button 
                  onClick={handleLogout} 
                  className="text-stone-300 hover:text-red-500 transition"
                  title={lang === "en" ? "Logout" : "Ondoka"}
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}

            {/* CART */}
            <Link 
              href="/cart" 
              className="relative group p-2"
              title={lang === "en" ? `Cart (${cartCount} items)` : `Kapu (Bidhaa ${cartCount})`}
            >
              <ShoppingBag size={22} className="group-hover:text-[#5B2C6F] transition" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-0 bg-[#C5A059] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* SEARCH OVERLAY (Hapa haijabadilika) */}
        {isSearchOpen && (
          <div className="absolute top-0 left-0 w-full bg-white shadow-2xl animate-in slide-in-from-top duration-300 z-[110] border-b border-stone-100">
            <div className="container mx-auto px-6 py-10">
              <div className="flex items-center border-b-2 border-[#5B2C6F] pb-4">
                <input 
                  autoFocus
                  type="text" 
                  placeholder={lang === "en" ? "What are you looking for?" : "Unatafuta nini leo?"}
                  className="w-full text-2xl md:text-4xl font-serif outline-none placeholder:text-stone-200 uppercase"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button 
                  onClick={() => {setIsSearchOpen(false); setSearchQuery("");}}
                  title={lang === "en" ? "Close" : "Funga"}
                >
                  <X size={32} className="text-stone-300 hover:text-black transition" />
                </button>
              </div>

              {searchQuery && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pb-6">
                  {searchResults.length > 0 ? (
                    searchResults.map(product => (
                      <Link 
                        key={product.id} 
                        href={`/shop/${product.id}`}
                        onClick={() => {setIsSearchOpen(false); setSearchQuery("");}}
                        className="flex items-center gap-4 p-4 bg-stone-50 hover:bg-stone-100 rounded-xl transition group"
                      >
                        <div className="relative w-20 h-20 shrink-0 bg-white rounded-lg overflow-hidden border border-stone-100">
                          <Image src={product.image_url} alt={product.name} fill className="object-contain p-2" />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest">{product.category}</h4>
                          <h3 className="text-sm font-serif text-stone-800 uppercase leading-tight">{product.name}</h3>
                          <p className="text-xs font-bold text-[#5B2C6F] mt-1">TZS {product.price.toLocaleString()}</p>
                        </div>
                        <ArrowRight size={14} className="ml-auto text-stone-300 group-hover:text-[#5B2C6F] transition" />
                      </Link>
                    ))
                  ) : (
                    <p className="col-span-full text-center py-10 font-serif italic text-stone-400">
                      {lang === "en" ? `No results for "${searchQuery}"` : `Hakuna matokeo kwa "${searchQuery}"`}
                    </p>
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