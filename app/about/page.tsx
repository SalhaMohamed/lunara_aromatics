"use client";

import Navbar from "@/components/Navbar";
import Image from "next/image";
import { BadgeCheck, Globe, Gem } from 'lucide-react';
import { useTranslation } from "@/app/hooks/useTranslation";

export default function AboutPage() {
  const t = useTranslation();
  return (
    <main className="min-h-screen bg-white font-sans">
      <Navbar />
      
      {/* HERO SECTION */}
      <section className="relative h-[70vh] w-full flex items-center justify-center overflow-hidden">
        {/* Picha ya Duka au Rafu za Kifahari */}
        <Image 
          src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1600&auto=format&fit=crop" 
          alt="Bahmad Perfumes Display" 
          fill 
          className="object-cover"
          priority
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-stone-900/50" /> 

        {/* Maandishi */}
        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 drop-shadow-xl tracking-wide">
            {t.curatorsOfElegance}
          </h1>
          <div className="w-20 h-[2px] bg-[#C5A059] mx-auto mb-8"></div>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-stone-100 font-light leading-relaxed drop-shadow-md">
            "{t.aboutPhrase}"
          </p>
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="py-24 container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        {/* Upande wa Maelezo */}
        <div className="space-y-8 order-2 md:order-1">
          <h2 className="text-3xl font-serif text-[#5B2C6F] uppercase tracking-widest">
            {t.theBahmadCollection}
          </h2>
          <div className="space-y-6 text-stone-600 leading-relaxed text-lg font-light">
            <p>
              {t.aboutWelcome}
            </p>
            <p>
              {t.aboutAuthenticity}
            </p>
            <p>
              {t.aboutGuarantee}
            </p>
          </div>
        </div>

        {/* Upande wa Picha ndogo */}
        <div className="relative h-[500px] bg-stone-100 order-1 md:order-2 rounded-sm overflow-hidden shadow-2xl">
           <Image 
             src="https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?q=80&w=800"
             alt="Luxury Products Display"
             fill
             className="object-cover"
           />
        </div>
      </section>

      {/* VALUE PROPOSITION (Sifa za Duka) */}
      <section className="bg-[#fdfbf7] py-20 border-t border-stone-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            
            {/* Feature 1 */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-[#C5A059]">
                <BadgeCheck size={32} strokeWidth={1.5} />
              </div>
              <h4 className="font-bold text-[#5B2C6F] text-sm tracking-[0.2em] uppercase">{t.authentic}</h4>
              <p className="text-stone-500 text-sm max-w-xs mx-auto">
                {t.authenticDesc}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-[#C5A059]">
                <Globe size={32} strokeWidth={1.5} />
              </div>
              <h4 className="font-bold text-[#5B2C6F] text-sm tracking-[0.2em] uppercase">{t.globalBrands}</h4>
              <p className="text-stone-500 text-sm max-w-xs mx-auto">
                {t.globalBrandsDesc}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-[#C5A059]">
                <Gem size={32} strokeWidth={1.5} />
              </div>
              <h4 className="font-bold text-[#5B2C6F] text-sm tracking-[0.2em] uppercase">{t.diverseCollection}</h4>
              <p className="text-stone-500 text-sm max-w-xs mx-auto">
                {t.diverseCollectionDesc}
              </p>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}