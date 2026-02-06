import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

const allCategories = [
  { name: "Perfumes", slug: "perfumes", count: "12 Products", image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=400" },
  { name: "Soaps & Bath", slug: "soaps-bath", count: "8 Products", image: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=400" },
  { name: "Lotions & Oils", slug: "lotions-oils", count: "15 Products", image: "https://images.unsplash.com/photo-1616245100650-671c668b556f?q=80&w=400" },
  { name: "Home Fragrance", slug: "home-fragrance", count: "10 Products", image: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?q=80&w=400" },
];

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-6 py-16">
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-[#5B2C6F]">Browse by Category</h1>
          <p className="text-stone-400 mt-4 uppercase text-[10px] tracking-[0.4em]">Luxury Essentials for You</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {allCategories.map((cat, index) => (
            /* LINK IMEBADILISHWA HAPA */
            <Link href={`/categories/${cat.slug}`} key={index} className="group relative h-96 overflow-hidden block border border-gray-100 shadow-sm">
              <Image 
                src={cat.image} 
                alt={cat.name} 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-[#5B2C6F]/30 transition-all duration-700 flex flex-col justify-center items-center text-white">
                <h3 className="text-3xl font-serif tracking-widest uppercase">{cat.name}</h3>
                <div className="h-[1px] w-0 group-hover:w-24 bg-white transition-all duration-500 mt-4 mb-2"></div>
                <p className="text-[10px] uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {cat.count}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}