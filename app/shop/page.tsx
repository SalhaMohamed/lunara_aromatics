"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) setProducts(data || []);
      setLoading(false);
    }
    getProducts();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <div className="mb-16">
          <h1 className="text-5xl font-serif text-[#5B2C6F] uppercase">The Boutique</h1>
          <p className="text-stone-400 mt-2 uppercase text-[10px] tracking-[0.3em]">Handpicked Luxury Inventory</p>
        </div>
        
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
             <div className="w-8 h-8 border-2 border-[#5B2C6F] border-t-transparent rounded-full animate-spin"></div>
             <p className="text-stone-400 font-serif italic text-sm">Loading elegance...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
            {products.map((product) => (
              <Link href={`/shop/${product.id}`} key={product.id} className="group">
                {/* IMAGE CONTAINER - Updated to object-contain */}
                <div className="relative aspect-[3/4] bg-[#FDFDFD] mb-6 overflow-hidden border border-stone-50 shadow-sm transition-all group-hover:shadow-md">
                  <Image 
                    src={product.image_url} 
                    alt={product.name} 
                    fill 
                    className="object-contain p-6 group-hover:scale-105 transition duration-1000" 
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">{product.category.replace('-', ' ')}</h3>
                      <h2 className="text-lg font-serif text-stone-800 uppercase group-hover:text-[#5B2C6F] transition-colors">{product.name}</h2>
                    </div>
                  </div>
                  
                  <p className="text-[#C5A059] font-medium pt-1">TZS {product.price.toLocaleString()}</p>
                  
                  {/* SIZES - Kuonyesha sizes zilizopo */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {product.sizes.map((size: string, i: number) => (
                        <span key={i} className="text-[8px] border border-stone-100 px-1.5 py-0.5 text-stone-400 rounded-sm">
                          {size}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}