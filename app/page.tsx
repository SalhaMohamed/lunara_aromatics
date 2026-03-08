"use client";
import { useState } from "react"; // Tumeongeza hii kwa ajili ya search
import { useRouter } from "next/navigation"; // Tumeongeza hii kwa ajili ya kuhamisha page
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { Instagram, Facebook, ArrowRight, Sparkles, MessageCircle, Clock, Phone, ShoppingBag, Search } from 'lucide-react';
import { useTranslation } from "@/app/hooks/useTranslation";
import { useLanguage } from "@/app/context/LanguageContext";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const t = useTranslation();
  const { lang } = useLanguage();

  const SOCIAL_LINKS = {
    facebook: "https://www.facebook.com/profile.php?id=61575858056078",
    instagram: "https://www.instagram.com/mazuri_perfume/",
    whatsappGroup: "https://chat.whatsapp.com/KjjJcIqELj2JDDZBzxhKAQ"
  };

  // Logic ya kuelekeza search kwenye Shop Page
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase().trim();
    
    // Logic ya kutambua jinsia hata kama mteja ametumia maneno tofauti
    if (["men", "male", "boy", "kiume", "wa kiume"].includes(query)) {
      router.push("/shop?gender=male");
    } else if (["women", "female", "girl", "woman", "kike", "wa kike"].includes(query)) {
      router.push("/shop?gender=female");
    } else if (["unisex", "wote", "shared"].includes(query)) {
      router.push("/shop?gender=unisex");
    } else {
      // Kama ametafuta jina la bidhaa (mfano: "Oud")
      router.push(`/shop?search=${encodeURIComponent(query)}`);
    }
  };

  const categories = [
    { name: "PERFUMES", slug: "perfumes", image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=400&auto=format&fit=crop" },
    { name: "SOAPS & BATH", slug: "soaps-bath", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop" },
    { name: "LOTIONS & OILS", slug: "lotions-oils", image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=400&auto=format&fit=crop" },
    { name: "HOME FRAGRANCE", slug: "home-fragrance", image: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?q=80&w=400&auto=format&fit=crop" },
  ];

  return (
    <main className="min-h-screen bg-[#FDFCFB] font-sans text-stone-900">
      <div className="w-full bg-[#5B2C6F] py-2 text-center overflow-hidden relative z-[60]">
        <p className="text-[9px] md:text-[10px] text-white uppercase tracking-[0.3em] animate-pulse px-4">
          ✨ {t.welcomeBanner} <span className="font-bold text-[#C5A059]">{t.discountText}</span> ✨
        </p>
      </div>
      
      <Navbar />

      {/* --- HERO SECTION WITH LIVE SEARCH --- */}
      <section className="relative w-full min-h-[90vh] flex items-center bg-[#F4F1ED] overflow-hidden">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center pt-12">
          
          <div className="relative z-10 space-y-8 order-2 md:order-1 text-center md:text-left">
            <h1 className="text-6xl md:text-8xl font-serif text-[#C5A059] leading-[1.1]">
              Experience <br />
              Pure <br />
              <span className="text-[#5B2C6F] italic font-light">Elegance</span>
            </h1>
            
            {/* Search Bar Logic Added Here */}
              <form onSubmit={handleSearch} className="max-w-md mx-auto md:mx-0 relative group">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent border-b border-stone-300 py-4 pr-12 focus:outline-none focus:border-[#5B2C6F] transition-all text-sm font-light italic"
              />
              <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 group-hover:text-[#5B2C6F] transition-colors">
                <Search size={20} />
              </button>
            </form>
            
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/shop">
                <button className="bg-[#5B2C6F] text-white px-10 py-5 rounded-sm hover:bg-[#4A235A] transition-all duration-300 uppercase text-[11px] font-bold tracking-[0.3em] shadow-xl w-full sm:w-auto">
                  Shop All
                </button>
              </Link>
            </div>
          </div>

          <div className="relative z-10 order-1 md:order-2">
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto shadow-2xl">
              <Image 
                src="https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop" 
                alt="Luxury Fragrance" 
                fill 
                className="object-cover border-[12px] border-white shadow-inner"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 container mx-auto px-6">
        <div className="flex items-center justify-between mb-16">
                  <h2 className="text-4xl font-serif text-[#5B2C6F]">{t.ourCollections}</h2>
          <div className="hidden md:block h-[1px] flex-grow mx-12 bg-stone-100"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {categories.map((cat, index) => (
            <Link href={`/categories/${cat.slug}`} key={index} className="group cursor-pointer block">
              <div className="relative aspect-[4/5] bg-[#F9F9F9] mb-6 overflow-hidden shadow-sm transition-transform duration-700 hover:shadow-2xl">
                <Image src={cat.image} alt={cat.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-[#5B2C6F]/0 group-hover:bg-[#5B2C6F]/5 transition-colors duration-500"></div>
              </div>
              <div className="text-center">
                <h3 className="text-[11px] font-bold text-stone-800 uppercase tracking-[0.35em] group-hover:text-[#C5A059] transition-colors duration-300">{cat.name}</h3>
                <div className="w-8 h-[1px] bg-stone-200 mx-auto mt-3 group-hover:w-16 group-hover:bg-[#C5A059] transition-all duration-500"></div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* GENDER SECTION (BANNERS) */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
         <div className="relative h-[400px] md:h-[500px] group overflow-hidden">
            <Image src="https://images.unsplash.com/photo-1611242956059-53e4c29e6b22?q=80&w=687&auto=format&fit=crop" alt="Shop for Him" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                <h3 className="text-4xl font-serif mb-4 italic">{t.exclusiveForHim}</h3>
                <Link href="/shop?gender=male">
                  <button className="border border-white px-8 py-4 text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-white hover:text-black transition">{t.exploreCollection}</button>
                </Link>
            </div>
         </div>
         <div className="relative h-[400px] md:h-[500px] group overflow-hidden">
            <Image src="https://images.unsplash.com/photo-1601068785450-ba55f33dfe0c?q=80&w=685&auto=format&fit=crop" alt="Shop for Her" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                <h3 className="text-4xl font-serif mb-4 italic">{t.gracefulForHer}</h3>
                <Link href="/shop?gender=female">
                  <button className="border border-white px-8 py-4 text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-white hover:text-black transition">{t.exploreCollection}</button>
                </Link>
            </div>
         </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-24 bg-[#fdfbf7]">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
            <h3 className="text-4xl font-serif text-[#5B2C6F]">{t.whatOurClientsSay}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{ name: "Aisha Salum", comment: t.testimonials_quote_1 }, { name: "Juma Hamis", comment: t.testimonials_quote_2 }, { name: "Sarah John", comment: t.testimonials_quote_3 }].map((f, i) => (
              <div key={i} className="bg-white p-10 shadow-sm border border-stone-100 text-center">
                <p className="text-stone-500 italic mb-8">"{f.comment}"</p>
                <h4 className="text-[10px] font-black uppercase tracking-widest">{f.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1a1510] text-stone-300 py-20 border-t border-[#C5A059]/20">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="space-y-6">
            <h2 className="text-3xl font-serif text-white italic">Lunara<span className="text-[#C5A059]">.</span></h2>
            <p className="text-xs">{t.description}</p>
          </div>
          <div className="space-y-6">
             <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center justify-center md:justify-start gap-2"><Clock size={14} className="text-[#C5A059]" /> Opening Hours</h3>
             <p className="text-xs">{t.footer_opening_hours}</p>
          </div>
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center justify-center md:justify-start gap-2"><Phone size={14} className="text-[#C5A059]" /> Contact Us</h3>
             <p className="text-xs">{t.footer_contact_number}</p>
          </div>
          <div className="space-y-6">
             <h3 className="text-xs font-bold text-white uppercase tracking-widest">Follow Us</h3>
             <div className="flex justify-center md:justify-start gap-4">
                <a href={SOCIAL_LINKS.instagram} target="_blank" className="p-2 border border-stone-700 rounded-full hover:bg-[#C5A059]"><Instagram size={18} /></a>
                <a href={SOCIAL_LINKS.facebook} target="_blank" className="p-2 border border-stone-700 rounded-full hover:bg-[#1877F2]"><Facebook size={18} /></a>
             </div>
             <div className="pt-4">
                <a href={SOCIAL_LINKS.whatsappGroup} target="_blank" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-sm text-[10px] font-bold uppercase tracking-wider"><MessageCircle size={16} /> {t.joinVIPGroup}</a>
             </div>
          </div>
        </div>
        <div className="container mx-auto px-6 mt-16 pt-8 border-t border-stone-800 text-center">
          <p className="text-[10px] text-stone-500 tracking-[0.2em] uppercase">© 2026 LUNARA AROMATICS | DESIGNED FOR LUXURY</p>
        </div>
      </footer>
    </main>
  );
}