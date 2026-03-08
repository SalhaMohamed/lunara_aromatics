"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, SearchX } from "lucide-react";
import { useTranslation } from "@/app/hooks/useTranslation";

const supabase = createClient();

function ShopContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslation();
  
  const searchParams = useSearchParams();
  const genderFilter = searchParams.get('gender'); 
  const searchQuery = searchParams.get('search');

  // Logic ya kuangalia kama bidhaa ni mpya (chini ya siku 7)
  const isNewProduct = (dateString: string) => {
    const createdDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  useEffect(() => {
    async function getProducts() {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (genderFilter === 'male') {
        query = query.or('gender.eq.male,gender.eq.unisex');
      } else if (genderFilter === 'female') {
        query = query.or('gender.eq.female,gender.eq.unisex');
      } else if (genderFilter === 'unisex') {
        query = query.eq('gender', 'unisex');
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (!error) setProducts(data || []);
      setLoading(false);
    }
    
    getProducts();
  }, [genderFilter, searchQuery]);

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      {/* HEADER SECTION */}
      <div className="mb-20 text-center md:text-left">
        <h1 className="text-4xl md:text-6xl font-serif text-[#5B2C6F] uppercase tracking-tight">
          {searchQuery ? `Results: ${searchQuery}` : genderFilter ? `${genderFilter} Collection` : t.theBoutique}
        </h1>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4">
          <p className="text-stone-400 uppercase text-[10px] tracking-[0.4em] font-black">
            {searchQuery ? t.searchingLuxury : t.handpickedPremium}
          </p>
          {(genderFilter || searchQuery) && (
            <Link href="/shop" className="text-[10px] text-[#C5A059] font-black underline uppercase tracking-widest hover:text-black transition">
              {t.resetFilters}
            </Link>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-40 flex flex-col items-center gap-6">
           <div className="w-10 h-10 border-2 border-[#5B2C6F] border-t-transparent rounded-full animate-spin"></div>
           <p className="text-stone-400 font-serif italic tracking-widest text-xs uppercase">{t.curatingElegance}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {products.length > 0 ? (
            products.map((product) => (
              <Link href={`/shop/${product.id}`} key={product.id} className="group relative">
                <div className="relative aspect-[3/4] bg-[#FDFDFD] mb-8 overflow-hidden border border-stone-50 shadow-sm transition-all duration-700 group-hover:shadow-xl">
                  
                  {/* NEW ARRIVAL TAG */}
                  {isNewProduct(product.created_at) && (
                    <div className="absolute top-4 left-4 z-10 bg-black text-white text-[8px] font-black uppercase px-3 py-1.5 tracking-widest flex items-center gap-2 shadow-lg">
                      <Sparkles size={10} className="text-[#C5A059]" /> New Arrival
                    </div>
                  )}

                  <Image 
                    src={product.image_url} 
                    alt={product.name} 
                    fill 
                    className="object-contain p-8 group-hover:scale-110 transition duration-1000 ease-in-out" 
                  />
                  
                  {/* HOVER OVERLAY */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div className="space-y-2 text-center">
                  <h3 className="text-[9px] font-black text-[#C5A059] uppercase tracking-[0.3em]">
                    {product.category?.replace('-', ' ')} {product.gender && `| ${product.gender}`}
                  </h3>
                  <h2 className="text-lg font-serif text-stone-800 uppercase group-hover:text-[#5B2C6F] transition-colors duration-300 tracking-tight">
                    {product.name}
                  </h2>
                  <p className="text-stone-900 font-bold text-sm tracking-tighter">
                    TZS {product.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-40 border-2 border-dashed border-stone-50 rounded-lg">
              <SearchX size={40} className="mx-auto text-stone-200 mb-4" />
              <p className="font-serif italic text-stone-400 uppercase tracking-widest text-xs">No pieces found matching your criteria.</p>
              <Link href="/shop" className="mt-6 inline-block bg-[#5B2C6F] text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-black transition">
                View All Products
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse font-serif text-[#5B2C6F] tracking-[0.5em] uppercase text-sm">Bahmad Boutique</div>
        </div>
      }>
        <ShopContent />
      </Suspense>
    </main>
  );
}