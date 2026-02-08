"use client";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { Instagram, Facebook, ArrowRight, Sparkles, Tag } from 'lucide-react';

export default function Home() {
  const categories = [
    { 
      name: "PERFUMES", 
      slug: "perfumes",
      image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=400&auto=format&fit=crop" 
    },
    { 
      name: "SOAPS & BATH", 
      slug: "soaps-bath",
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop" 
    },
    { 
      name: "LOTIONS & OILS", 
      slug: "lotions-oils",
      image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=400&auto=format&fit=crop" 
    },
    { 
      name: "HOME FRAGRANCE", 
      slug: "home-fragrance",
      image: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?q=80&w=400&auto=format&fit=crop" 
    },
  ];

  return (
    <main className="min-h-screen bg-white font-sans text-stone-900">
      {/* Top Notification Bar */}
      <div className="w-full bg-[#5B2C6F] py-2 text-center overflow-hidden">
        <p className="text-[9px] md:text-[10px] text-white uppercase tracking-[0.3em] animate-pulse">
          ✨ Karibu Lunara! Jisajili sasa upate <span className="font-bold text-[#C5A059]">10% Discount</span> kupitia SMS ✨
        </p>
      </div>
      
      <Navbar />

      {/* Improved Hero Section with Offer */}
      <section className="relative w-full min-h-[700px] bg-[#fdfbf7] flex items-center overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#5B2C6F]/5 clip-path-slant hidden md:block"></div>
        
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10 py-20">
          
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20">
              <Sparkles size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Special Welcome Offer</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-serif text-[#C5A059] leading-[1.1]">
              Experience Pure <br />
              <span className="italic text-[#5B2C6F]">Elegance</span>
            </h1>
            
            <p className="text-stone-500 max-w-sm text-lg leading-relaxed font-light">
              Elevate your lifestyle with our curated luxury scents. 
              <span className="block mt-2 font-medium text-[#5B2C6F]">Pata punguzo la 10% kwenye oda yako ya kwanza ukisajili namba yako leo.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <button className="bg-[#5B2C6F] text-white px-10 py-5 rounded-sm hover:bg-[#4A235A] transition-all duration-300 uppercase text-[11px] font-bold tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 w-full sm:w-auto">
                  Jisajili na Upate Ofa <ArrowRight size={16} />
                </button>
              </Link>
              <Link href="/categories">
                <button className="bg-transparent border border-stone-200 text-stone-800 px-10 py-5 rounded-sm hover:bg-white transition-all duration-300 uppercase text-[11px] font-bold tracking-[0.3em] w-full sm:w-auto">
                  Shop Now
                </button>
              </Link>
            </div>
          </div>

          <div className="relative h-[600px] w-full hidden md:block group">
            {/* Floating Discount Badge */}
            <div className="absolute top-10 right-10 z-20 w-24 h-24 bg-[#C5A059] rounded-full flex flex-col items-center justify-center text-white shadow-2xl border-4 border-white animate-bounce">
              <span className="text-xl font-black">10%</span>
              <span className="text-[9px] font-bold uppercase">OFF</span>
            </div>

            <Image 
              src="https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop"
              alt="Lunara Premium Fragrance"
              fill
              className="object-contain drop-shadow-2xl transition-transform duration-1000 group-hover:scale-105"
              priority
            />
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 container mx-auto px-6">
        <div className="flex items-center justify-between mb-16">
          <h2 className="text-4xl font-serif text-[#5B2C6F]">Our Collections</h2>
          <div className="hidden md:block h-[1px] flex-grow mx-12 bg-stone-100"></div>
          <Link href="/categories" className="text-xs font-bold text-[#C5A059] uppercase tracking-widest hover:text-[#5B2C6F] transition">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {categories.map((cat, index) => (
            <Link href={`/categories/${cat.slug}`} key={index} className="group cursor-pointer block">
              <div className="relative aspect-[4/5] bg-[#F9F9F9] mb-6 overflow-hidden shadow-sm transition-transform duration-700 hover:shadow-2xl">
                <Image 
                  src={cat.image} 
                  alt={cat.name} 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-[#5B2C6F]/0 group-hover:bg-[#5B2C6F]/5 transition-colors duration-500"></div>
              </div>
              <div className="text-center">
                <h3 className="text-[11px] font-bold text-stone-800 uppercase tracking-[0.35em] group-hover:text-[#C5A059] transition-colors duration-300">
                  {cat.name}
                </h3>
                <div className="w-8 h-[1px] bg-stone-200 mx-auto mt-3 group-hover:w-16 group-hover:bg-[#C5A059] transition-all duration-500"></div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-stone-100 bg-[#F9F7F4]">
        <div className="container mx-auto px-6 flex flex-col items-center">
          <h2 className="text-2xl font-serif text-[#5B2C6F] mb-8 italic">Lunara Aromatics</h2>
          <div className="flex gap-8 mb-12">
            <Instagram size={20} className="text-stone-400 hover:text-[#5B2C6F] transition-colors cursor-pointer" />
            <Facebook size={20} className="text-stone-400 hover:text-[#5B2C6F] transition-colors cursor-pointer" />
          </div>
          <p className="text-[10px] text-stone-300 tracking-[0.4em] uppercase">
            © 2026 LUNARA AROMATICS | ZANZIBAR & DAR ES SALAAM
          </p>
        </div>
      </footer>
    </main>
  );
}