"use client";
import React, { use } from "react";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { allProducts } from "@/app/data/products"; // <--- TUNATUMIA DATA MOJA RASMI

export default function CategoryProducts({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  // Hapa tunachuja bidhaa kulingana na slug ya category
  const filteredProducts = allProducts.filter(p => p.category === slug);

  return (
    <main className="min-h-screen bg-white font-sans">
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        {/* Breadcrumbs */}
        <nav className="text-[10px] uppercase tracking-widest text-gray-400 mb-8">
          <Link href="/" className="hover:text-stone-800">Home</Link> / 
          <Link href="/categories" className="ml-1 hover:text-stone-800">Categories</Link> / 
          <span className="ml-1 text-[#5B2C6F] font-bold">{slug}</span>
        </nav>

        <h1 className="text-5xl font-serif text-[#5B2C6F] mb-2 capitalize">
          {slug.replace('-', ' & ')}
        </h1>
        <p className="text-gray-400 mb-12 uppercase text-[10px] tracking-[0.3em]">
          Handpicked collection for your lifestyle
        </p>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredProducts.map((product) => (
              /* LINK INAPELEKA KWENYE SHOP PAGE YENYE ID HUSIKA */
              <Link href={`/shop/${product.id}`} key={product.id} className="group">
                <div className="relative aspect-[3/4] bg-[#F9F9F9] mb-6 overflow-hidden border border-gray-100 shadow-sm transition-all group-hover:shadow-xl">
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-1000" 
                  />
                  {/* Quick view overlay */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white/90 text-[10px] font-bold py-3 px-6 uppercase tracking-widest text-stone-800 shadow-sm">
                      View Scent
                    </span>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest group-hover:text-[#C5A059] transition-colors">
                  {product.name}
                </h3>
                <p className="text-[#C5A059] mt-2 font-medium">Tsh {product.price.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
             <p className="text-stone-400 italic">No products found in this category yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}