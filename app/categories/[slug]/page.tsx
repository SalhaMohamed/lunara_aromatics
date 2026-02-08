"use client";
import React, { use, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

export default function CategoryProducts({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', slug); 
      
      if (!error) setProducts(data || []);
      setLoading(false);
    };
    getProducts();
  }, [slug]);

  return (
    <main className="min-h-screen bg-white font-sans text-stone-800">
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-5xl font-serif text-[#5B2C6F] mb-2 capitalize">{slug.replace('-', ' & ')}</h1>
        <p className="text-gray-400 mb-12 uppercase text-[10px] tracking-[0.3em]">Handpicked luxury items</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse text-stone-400 font-serif italic">Inapakia bidhaa za Lunara...</div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {products.map((product) => (
              <Link href={`/shop/${product.id}`} key={product.id} className="group">
                {/* IMAGE CONTAINER - Sasa picha haikatwi */}
                <div className="relative aspect-[3/4] bg-[#FDFDFD] mb-6 overflow-hidden border border-gray-100 shadow-sm transition-all group-hover:shadow-md">
                  {product.image_url && (
                    <Image 
                      src={product.image_url} 
                      alt={product.name} 
                      fill 
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-1000" 
                    />
                  )}
                </div>

                {/* PRODUCT INFO */}
                <div className="space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#5B2C6F]">{product.name}</h3>
                  <p className="text-[#C5A059] font-medium">TZS {product.price.toLocaleString()}</p>
                  
                  {/* SIZES DISPLAY - Inaonyesha sizes ulizoweka Admin */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {product.sizes.map((size: string, idx: number) => (
                        <span key={idx} className="text-[9px] px-2 py-1 border border-stone-200 text-stone-500 rounded-full uppercase tracking-tighter">
                          {size}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-stone-300 italic font-serif">
            No products found in this category yet.
          </div>
        )}
      </div>
    </main>
  );
}