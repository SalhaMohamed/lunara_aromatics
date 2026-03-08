"use client";
import React, { use, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

export default function CategoryProducts({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const searchParams = useSearchParams();
  const productIdToFind = searchParams.get("productId");

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

  useEffect(() => {
    if (!loading && productIdToFind) {
      const element = document.getElementById(`product-${productIdToFind}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Inaongeza ring ya rangi kuonyesha bidhaa iliyochaguliwa
          element.classList.add("ring-1", "ring-[#5B2C6F]", "ring-offset-4");
        }, 600); 
      }
    }
  }, [loading, productIdToFind]);

  return (
    <main className="min-h-screen bg-white font-sans text-stone-800">
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-5xl font-serif text-[#5B2C6F] mb-2 capitalize leading-tight">
          {slug.replace('-', ' & ')}
        </h1>
        <p className="text-gray-400 mb-12 uppercase text-[10px] tracking-[0.3em]">
          Handpicked luxury items
        </p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse text-stone-300 font-serif italic tracking-widest">
              loading Lunara products...
            </div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {products.map((product, index) => (
              <div 
                id={`product-${product.id}`} 
                key={product.id} 
                className="opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
              >
                <Link href={`/shop/${product.id}`} className="group">
                  <div className="relative aspect-[3/4] bg-[#FDFDFD] mb-6 overflow-hidden border border-gray-100 shadow-sm transition-all group-hover:shadow-lg group-hover:border-[#5B2C6F]/10">
                    {product.image_url && (
                      <Image 
                        src={product.image_url} 
                        alt={product.name} 
                        fill 
                        className="object-contain p-6 group-hover:scale-110 transition-transform duration-1000 ease-out" 
                      />
                    )}
                    {/* Hover Overlay kidogo */}
                    <div className="absolute inset-0 bg-[#5B2C6F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  <div className="space-y-1 px-1">
                    <h3 className="text-xs font-black uppercase tracking-widest text-stone-900 group-hover:text-[#5B2C6F] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[#C5A059] font-serif italic text-sm">
                      TZS {product.price.toLocaleString()}
                    </p>
                    
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {product.sizes.map((size: string, idx: number) => (
                          <span key={idx} className="text-[8px] px-3 py-1 bg-stone-50 border border-stone-100 text-stone-400 rounded-full uppercase tracking-tighter">
                            {size}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-stone-300 italic font-serif">
            No products found in this category yet.
          </div>
        )}
      </div>

      {/* CSS Animation Logic */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }
      `}</style>
    </main>
  );
}