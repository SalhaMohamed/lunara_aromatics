"use client";

import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { useLanguage } from "@/app/context/LanguageContext"; // Tumeongeza hii
import { allProducts } from "@/app/data/products";
import { translations } from "@/app/data/translations";

export default function ProductPage() {
  const params = useParams();
  const id = params.id;
  const { addToCart } = useCart();
  const { lang } = useLanguage(); // Sasa inasikiliza Navbar
  const t = translations[lang];
  
  const product = allProducts.find((p) => p.id === id);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || "");

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-serif text-stone-400">{t.noResults}</h2>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
      size: selectedSize
    });
    
    // Toast inayofuata lugha ya website
    toast.success(t.addedToCart, {
      description: t.viewCart,
      action: {
        label: lang === 'en' ? 'Cart' : 'Kapu',
        onClick: () => window.location.href = "/cart",
      },
    });
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* IMAGE WITH ZOOM EFFECT */}
          <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden group shadow-sm border border-stone-100">
            <Image 
              src={product.image} 
              alt={product.name} 
              fill 
              className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
              priority 
            />
          </div>

          {/* DETAILS */}
          <div className="space-y-8">
            <div>
              <p className="text-[#C5A059] text-xs font-bold uppercase tracking-[0.3em] mb-2">
                {product.category.replace("-", " & ")}
              </p>
              <h1 className="text-4xl md:text-5xl font-serif text-[#5B2C6F] leading-tight">
                {product.name}
              </h1>
              <p className="text-2xl text-stone-800 mt-4 font-light">
                TZS {product.price.toLocaleString()}
              </p>
            </div>

            <p className="text-stone-500 leading-relaxed font-light">
              {product.description}
            </p>

            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                {lang === 'en' ? 'Select Size' : 'Chagua Saizi'}
              </p>
              <div className="flex gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-2 text-xs font-bold border transition-all ${
                      selectedSize === size 
                      ? 'border-[#5B2C6F] bg-[#5B2C6F] text-white' 
                      : 'border-stone-200 text-stone-500 hover:border-stone-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <div className="flex items-center border border-stone-200 w-fit">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-4 hover:bg-stone-50"><Minus size={16}/></button>
                <span className="px-6 font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-4 hover:bg-stone-50"><Plus size={16}/></button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                className="flex-grow bg-[#5B2C6F] text-white py-4 uppercase text-xs font-bold tracking-[0.2em] hover:bg-[#4A235A] transition shadow-lg flex items-center justify-center gap-3"
              >
                <ShoppingBag size={18} />
                {lang === 'en' ? 'Add to Bag' : 'Weka kwenye Kapu'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}