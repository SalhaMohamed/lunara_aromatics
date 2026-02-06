"use client";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

// Tumeongeza bidhaa zaidi na kuziwekea category ili zilingane na zile slugs za categories
const allProducts = [
  { 
    id: '1', 
    name: "Sauvage Dior", 
    price: 120000, 
    category: 'perfumes',
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600" 
  },
  { 
    id: '2', 
    name: "Midnight Lavender", 
    price: 85000, 
    category: 'perfumes',
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600" 
  },
  { 
    id: '3', 
    name: "Organic Honey Soap", 
    price: 12000, 
    category: 'soaps-bath',
    image: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=600" 
  },
  { 
    id: '4', 
    name: "Coco Butter Oil", 
    price: 45000, 
    category: 'lotions-oils',
    image: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?q=80&w=600" 
  },
  { 
    id: '5', 
    name: "Scented Candle", 
    price: 35000, 
    category: 'home-fragrance',
    image: "https://images.unsplash.com/photo-1603006375271-7f3b901bb3d7?q=80&w=600" 
  },
  { 
    id: '6', 
    name: "Royal Oud", 
    price: 150000, 
    category: 'perfumes',
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600" 
  }
];

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h1 className="text-5xl font-serif text-[#5B2C6F] uppercase tracking-tight">The Boutique</h1>
            <p className="text-stone-400 mt-2 uppercase text-[10px] tracking-[0.3em]">Curated Luxury Selection</p>
          </div>
          
          {/* Quick Filter Links */}
          <div className="flex gap-4 overflow-x-auto pb-2 w-full md:w-auto">
             <Link href="/categories" className="text-[10px] font-bold border border-stone-200 px-4 py-2 hover:bg-[#5B2C6F] hover:text-white transition uppercase tracking-widest whitespace-nowrap">
               Filter by Category
             </Link>
          </div>
        </div>
        
        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
          {allProducts.map((product) => (
            <Link href={`/shop/${product.id}`} key={product.id} className="group">
              <div className="relative aspect-[3/4] bg-[#F9F9F9] mb-6 overflow-hidden shadow-sm transition-all duration-500 group-hover:shadow-2xl">
                {/* Product Image */}
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  fill 
                  className="object-cover group-hover:scale-110 transition duration-1000 ease-in-out" 
                />
                
                {/* Hover Overlay with "View Details" */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500 flex items-center justify-center">
                   <span className="bg-white text-stone-900 px-6 py-2 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
                     View Product
                   </span>
                </div>
              </div>
              
              {/* Product Info */}
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">
                  {product.category.replace('-', ' ')}
                </h3>
                <h2 className="text-lg font-serif text-stone-800 group-hover:text-[#C5A059] transition-colors uppercase tracking-wide">
                  {product.name}
                </h2>
                <p className="text-[#C5A059] font-medium tracking-wider pt-1">
                  Tsh {product.price.toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}