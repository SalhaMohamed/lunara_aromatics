"use client";
import { useState, useEffect } from "react";
import { Search, ShoppingBag, Globe, X, ArrowRight, User, LogOut } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/app/data/translations";
import { allProducts } from "@/app/data/products";
import Link from "next/link";
import Image from "next/image";
import DiscountModal from "@/components/DiscountModal"; // Hakikisha umetengeneza hii file

export default function Navbar() {
  const { cartCount } = useCart();
  const { lang, setLang } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Hapa tunatengeneza hali ya Login (Kwa sasa ni false)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const t = translations[lang];

  // LIVE SEARCH LOGIC
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

  const handleLogout = () => {
    setIsLoggedIn(false);
    // Hapa tutafuta session ya Supabase baadaye
    window.location.href = "/login";
  };

  return (
    <>
      {/* Pop-up ya punguzo itatokea hapa */}
      <DiscountModal />

      <nav className="sticky top-0 z-[100] bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          
         {/* LOGO SECTION */}
<Link href="/" className="relative w-60 h-18 flex items-center justify-start group">
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
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-5">
            {/* Search Trigger */}
            <button onClick={() => setIsSearchOpen(true)} className="hover:text-[#C5A059] transition">
              <Search size={20} />
            </button>

            {/* Language Switcher */}
            <button 
              onClick={() => setLang(lang === "en" ? "sw" : "en")}
              className="flex items-center gap-1 text-[10px] font-bold border border-stone-200 px-2 py-1 rounded hover:bg-stone-50 transition"
            >
              <Globe size={12} />
              {lang === "en" ? "EN" : "SW"}
            </button>

            {/* USER LOGIN / LOGOUT LOGIC */}
            {!isLoggedIn ? (
              <Link href="/login" className="hover:text-[#5B2C6F] transition">
                <User size={22} />
              </Link>
            ) : (
              <button 
                onClick={handleLogout}
                className="text-red-400 hover:text-red-600 transition flex items-center gap-1"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            )}

            {/* CART */}
            <Link href="/cart" className="relative group">
              <ShoppingBag size={22} className="group-hover:text-[#5B2C6F] transition" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#C5A059] text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* LIVE SEARCH OVERLAY */}
        {isSearchOpen && (
          <div className="absolute top-0 left-0 w-full bg-white shadow-2xl animate-in slide-in-from-top duration-300 z-[110]">
            <div className="container mx-auto px-6 py-8">
              <div className="flex items-center border-b-2 border-[#5B2C6F] pb-2">
                <input 
                  autoFocus
                  type="text" 
                  placeholder={t.search}
                  className="w-full text-2xl font-serif outline-none"
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
                        <div className="relative w-16 h-16 shrink-0">
                          <Image src={product.image} alt={product.name} fill className="object-cover rounded" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-sm font-bold text-stone-800 uppercase">{product.name}</h4>
                          <p className="text-xs text-[#C5A059]">TZS {product.price.toLocaleString()}</p>
                        </div>
                        <ArrowRight size={16} className="text-gray-300" />
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 py-4">{t.noResults}</p>
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