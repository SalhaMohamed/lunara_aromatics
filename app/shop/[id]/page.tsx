"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
const supabase = createClient();
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { toast } from "sonner";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error && data) {
        setProduct(data);
        // Set size ya kwanza iwe selected by default
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#5B2C6F]" size={32} />
      <p className="text-stone-400 font-serif italic">Revealing elegance...</p>
    </div>
  );
  
  if (!product) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="text-center py-20 font-serif text-stone-400">Product not found in our boutique.</div>
    </div>
  );

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      quantity: quantity,
      size: selectedSize || "Standard"
    });
    toast.success(`${product.name} imewekwa kwenye kapu`);
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* PRODUCT IMAGE - Updated to object-contain */}
          <div className="relative aspect-square bg-[#FDFDFD] border border-stone-50 overflow-hidden shadow-sm">
            <Image 
              src={product.image_url} 
              alt={product.name} 
              fill 
              className="object-contain p-8 md:p-12 transition-transform duration-700 hover:scale-105" 
            />
          </div>
          
          <div className="space-y-8">
            <header>
              <p className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-3">
                {product.category?.replace('-', ' & ')}
              </p>
              <h1 className="text-4xl md:text-5xl font-serif text-[#5B2C6F] uppercase leading-tight">
                {product.name}
              </h1>
              <p className="text-2xl text-stone-800 mt-4 font-sans font-light tracking-tight">
                TZS {product.price.toLocaleString()}
              </p>
            </header>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Description</p>
              <p className="text-stone-500 font-light leading-relaxed text-sm italic border-l-2 border-stone-100 pl-4">
                {product.description || "No description available for this luxury piece."}
              </p>
            </div>
            
            {/* SIZES SECTION */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Available Sizes</p>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-8 py-3 text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 ${
                        selectedSize === size 
                        ? 'border-[#5B2C6F] bg-[#5B2C6F] text-white shadow-md' 
                        : 'border-stone-200 text-stone-500 hover:border-stone-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {/* QUANTITY PICKER */}
              <div className="flex items-center border border-stone-200 bg-white">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="p-4 hover:text-[#5B2C6F] transition-colors"
                >
                  <Minus size={14}/>
                </button>
                <span className="w-12 text-center font-sans font-bold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)} 
                  className="p-4 hover:text-[#5B2C6F] transition-colors"
                >
                  <Plus size={14}/>
                </button>
              </div>

              {/* ADD TO CART BUTTON */}
              <button 
                onClick={handleAddToCart} 
                className="flex-grow bg-[#5B2C6F] text-white py-5 px-8 uppercase text-[10px] font-bold tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#4A235A] transition shadow-lg active:scale-95"
              >
                <ShoppingBag size={18} /> Add to Bag
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}