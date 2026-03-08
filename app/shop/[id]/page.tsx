"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
const supabase = createClient();
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Loader2, ArrowLeft, Sparkles, Tag } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useLanguage } from "@/app/context/LanguageContext";
import { toast } from "sonner";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id; 
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const { addToCart } = useCart();
  const t = useTranslation();
  const { lang } = useLanguage();

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error && data) {
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  // Logic ya kuangalia kama ni bidhaa mpya (chini ya siku 7)
  const isNewArrival = (dateString: string) => {
    const createdDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <Loader2 className="animate-spin text-[#5B2C6F]" size={32} />
<p className="text-stone-400 font-serif italic tracking-widest uppercase text-[10px]">Bahmad Elegance...</p>
    </div>
  );
  
  if (!product) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-40">
        <p className="font-serif text-stone-400 mb-6 uppercase tracking-widest text-sm">{t.productNotFound}</p>
        <button onClick={() => router.push('/shop')} className="text-[#C5A059] font-black text-[10px] uppercase border-b-2 border-[#C5A059] pb-1">{t.backToShop}</button>
      </div>
    </div>
  );

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error(t.pleaseSelectSize);
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      quantity: quantity,
      size: selectedSize || "Standard",
      // Tunasukuma na taarifa za jumla ili Cart iweze kuzitumia
      wholesale_price: product.wholesale_price,
      wholesale_min_qty: product.wholesale_min_qty
    });

    toast.success(`${product.name} ${t.addedToCart}`, {
      description: `${t.sizeLabel}: ${selectedSize || "Standard"} • ${t.qtyLabel}: ${quantity}`,
      action: {
        label: t.viewBag,
        onClick: () => router.push('/cart')
      }
    });
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        
        {/* TOP NAVIGATION */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-black transition mb-12"
        >
          <ArrowLeft size={14} /> {t.backToCollection}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-start">
          
          {/* IMAGE SECTION */}
          <div className="relative aspect-[4/5] bg-[#FDFDFD] border border-stone-50 overflow-hidden group shadow-sm">
            {isNewArrival(product.created_at) && (
              <div className="absolute top-6 left-6 z-10 bg-black text-white text-[9px] font-black uppercase px-4 py-2 tracking-[0.3em] flex items-center gap-2 shadow-xl">
                <Sparkles size={10} /> {t.newArrival}
              </div>
            )}
            <Image 
              src={product.image_url} 
              alt={product.name} 
              fill 
              priority
              className="object-contain p-8 md:p-16 transition-transform duration-1000 group-hover:scale-105" 
            />
          </div>
          
          {/* CONTENT SECTION */}
          <div className="flex flex-col">
            <header className="mb-10">
              <p className="text-[#C5A059] text-[10px] font-black uppercase tracking-[0.5em] mb-4">
                {product.category?.replace('-', ' & ')}
              </p>
              <h1 className="text-4xl md:text-5xl font-serif text-[#5B2C6F] uppercase leading-tight mb-6">
                {product.name}
              </h1>
              <div className="flex flex-col gap-1">
                <p className="text-2xl font-bold text-stone-900 tracking-tighter">
                  TZS {product.price.toLocaleString()}
                </p>
                {/* Onyesha bei ya jumla kama ipo */}
                {product.wholesale_price && (
                  <p className="text-xs text-stone-500 font-medium">
                   {lang === 'sw' ? 'Au' : 'Or'} <span className="text-[#C5A059] font-bold">TZS {product.wholesale_price.toLocaleString()}</span> {lang === 'sw' ? `ukichukua pcs ${product.wholesale_min_qty || 6}+` : `for ${product.wholesale_min_qty || 6}+ pcs`}
                  </p>
                )}
              </div>
            </header>

            <div className="space-y-10">
              {/* DESCRIPTION */}
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 border-b border-stone-100 pb-2">{t.description}</p>
                <p className="text-stone-500 font-light leading-relaxed text-sm italic">
                  { (lang === 'sw') ? (product.descriptionSw || (product as any).description_sw || product.description) : (product.description || product.descriptionSw || (product as any).description_sw) }
                </p>
              </div>
              
              {/* SIZES */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">{t.selectSize}</p>
                    <span className="text-[9px] font-bold text-[#C5A059] uppercase tracking-widest underline cursor-help">{t.sizeGuide}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[70px] px-4 py-3 text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                          selectedSize === size 
                          ? 'border-[#5B2C6F] bg-[#5B2C6F] text-white shadow-lg scale-105' 
                          : 'border-stone-200 text-stone-400 hover:border-stone-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* ACTIONS */}
              <div className="flex flex-col gap-4 pt-6">
                
                {/* --- MPYA: WHOLESALE NUDGE NOTIFICATION --- */}
                {product.wholesale_price && (
                    <div className="w-full">
                       {(() => {
                         const minQty = product.wholesale_min_qty || 6;
                         const diff = minQty - quantity;

                         // CASE 1: Imefika bei ya jumla
                         if (diff <= 0) {
                            return (
                              <div className="bg-green-50 border border-green-200 p-3 flex items-center gap-3 animate-fade-in">
                                <Sparkles size={16} className="text-green-600" />
                                <p className="text-[10px] font-bold uppercase text-green-700 tracking-widest">
                                  {lang === 'sw' ? 'Hongera! Bei ya jumla imekubali.' : 'Wholesale price unlocked!'}
                                </p>
                              </div>
                            );
                         }
                         // CASE 2: Bado kidogo (1 au 2 zimebaki)
                         if (diff <= 2) {
                           return (
                             <div className="bg-[#FFF8E1] border border-[#C5A059]/30 p-3 flex items-center gap-3 animate-pulse">
                               <Tag size={16} className="text-[#C5A059]" />
                               <p className="text-[10px] font-bold uppercase text-[#C5A059] tracking-widest">
                                 {lang === 'sw' 
                                   ? `Ongeza ${diff} upate bei ya jumla!` 
                                   : `Add ${diff} more to get wholesale price!`}
                               </p>
                             </div>
                           );
                         }
                         return null;
                       })()}
                    </div>
                )}
                {/* --- MWISHO WA UPDATE --- */}

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center border border-stone-200 bg-white">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                      className="p-5 hover:text-[#5B2C6F] transition-colors"
                    >
                      <Minus size={14}/>
                    </button>
                    <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)} 
                      className="p-5 hover:text-[#5B2C6F] transition-colors"
                    >
                      <Plus size={14}/>
                    </button>
                  </div>

                  <button 
                    onClick={handleAddToCart} 
                    className="flex-grow bg-[#5B2C6F] text-white py-5 px-10 uppercase text-[10px] font-black tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-xl active:scale-95"
                  >
                    <ShoppingBag size={18} /> {t.addToBag}
                  </button>
                </div>
              </div>

              {/* TRUST BADGES */}
              <div className="grid grid-cols-2 gap-4 pt-10 border-t border-stone-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400">
                    <Loader2 size={12} />
                  </div>
                  <p className="text-[8px] font-black uppercase text-stone-400 tracking-widest">{t.fastDelivery}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400">
                    <Sparkles size={12} />
                  </div>
                  <p className="text-[8px] font-black uppercase text-stone-400 tracking-widest">{t.premiumQuality}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}