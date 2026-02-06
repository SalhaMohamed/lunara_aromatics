import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link"; // Hii ni muhimu kwa ajili ya kuunganisha pages
import { Instagram, Facebook } from 'lucide-react';

export default function Home() {
  // Nimeongeza 'slug' ili tujue link iende wapi
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
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full h-[600px] bg-[#fdfbf7] flex items-center overflow-hidden">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 z-10">
            <h1 className="text-5xl md:text-7xl font-serif text-[#C5A059] leading-[1.1]">
              Experience Pure <br />
              <span className="italic text-[#5B2C6F]">Elegance</span>
            </h1>
            <p className="text-stone-500 max-w-sm text-lg leading-relaxed font-light">
              Elevate your lifestyle with our curated collection of luxury scents and aromatics.
            </p>
            
            {/* HAPA NIMEREKEBISHA BUTTON IWE LINK */}
            <Link href="/categories">
              <button className="bg-[#5B2C6F] text-white px-12 py-4 rounded-sm hover:bg-[#4A235A] transition-all duration-300 uppercase text-[11px] font-bold tracking-[0.3em] shadow-xl mt-4">
                Shop the Collection
              </button>
            </Link>
          </div>

          <div className="relative h-[550px] w-full hidden md:block group">
            <Image 
              src="https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop"
              alt="Lunara Premium Fragrance"
              fill
              className="object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
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
            /* HAPA NIMEREKEBISHA KADI ZIWE LINKS */
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
      <footer className="py-20 border-t border-stone-100 bg-white">
        <div className="container mx-auto px-6 flex flex-col items-center">
          <div className="flex gap-8 mb-12">
            <Instagram size={20} className="text-stone-400 hover:text-[#5B2C6F] transition-colors cursor-pointer" />
            <Facebook size={20} className="text-stone-400 hover:text-[#5B2C6F] transition-colors cursor-pointer" />
          </div>
          <p className="text-[10px] text-stone-300 tracking-[0.4em] uppercase">
            © 2026 LUNARA AROMATICS
          </p>
        </div>
      </footer>
    </main>
  );
}