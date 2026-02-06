export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  sizes: string[];
}

export const allProducts: Product[] = [
  // PERFUMES
  {
    id: "p1",
    name: "Oud Royale Perfume",
    category: "perfumes",
    price: 85000,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop",
    description: "A luxury long-lasting scent with notes of oud, saffron, and vanilla. Perfect for evening wear and special occasions.",
    sizes: ["50ml", "100ml"]
  },
  {
    id: "p2",
    name: "Midnight Rose",
    category: "perfumes",
    price: 75000,
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop",
    description: "A delicate floral scent with a hint of spicy pepper and dark chocolate notes.",
    sizes: ["50ml", "100ml"]
  },

  // SOAPS & BATH
  {
    id: "s1",
    name: "Organic Shea Soap",
    category: "soaps-bath",
    price: 15000,
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop",
    description: "Handmade organic soap made with 100% pure shea butter and essential oils. Keeps your skin glowing and hydrated.",
    sizes: ["150g"]
  },
  {
    id: "s2",
    name: "Sea Salt Scrub",
    category: "soaps-bath",
    price: 25000,
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400&auto=format&fit=crop",
    description: "Exfoliating sea salt scrub with citrus essential oils to remove dead skin and reveal a smooth texture.",
    sizes: ["250g"]
  },

  // LOTIONS & OILS
  {
    id: "l1",
    name: "Lavender Body Oil",
    category: "lotions-oils",
    price: 45000,
    image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=400&auto=format&fit=crop",
    description: "Relaxing body oil infused with French lavender. Absorbs quickly without leaving a greasy residue.",
    sizes: ["200ml"]
  },

  // HOME FRAGRANCE
  {
    id: "h1",
    name: "Sandalwood Candle",
    category: "home-fragrance",
    price: 35000,
    image: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?q=80&w=400&auto=format&fit=crop",
    description: "Hand-poured soy wax candle with a rich sandalwood aroma that fills your room with warmth.",
    sizes: ["Standard Size"]
  }
];