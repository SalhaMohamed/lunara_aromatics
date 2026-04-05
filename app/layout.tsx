import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google"; 
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./context/LanguageContext";
import { createClient } from '@supabase/supabase-js';
import { Toaster } from "sonner";

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair'
});

const lato = Lato({ 
  subsets: ["latin"],
  weight: ['300', '400', '700'],
  variable: '--font-lato'
});

// --- SEO & SOCIAL MEDIA METADATA ---
export const metadata: Metadata = {
  title: {
    default: "Bahmad Perfumes | Luxury in Every Drop",
    template: "%s | Bahmad Perfumes"
  },
  description: "Tanzania's premier destination for luxury aromatics. Pata manukato bora, udi, na bidhaa za kujipenda kwa bei nafuu.",
  keywords: ["perfume Tanzania", "manukato", "udi", "luxury scents Dar es Salaam", "Bahmad"],
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png", // Kwa ajili ya iPhone bookmarks
  },
  
  // WhatsApp, Facebook & Instagram Preview (Open Graph)
  openGraph: {
    title: "Bahmad Perfumes| Luxury in Every Drop",
    description: "Elevate your lifestyle with our curated luxury scents. Pata punguzo la 10% kwenye oda yako ya kwanza.",
    url: "https://www.bahmadperfumes.com", // Badilisha na domain yako utakayohost
    siteName: "Bahmad Perfumes",
    images: [
      {
        url: "/og-image.jpg", // Hakikisha picha hii ipo kwenye folder la public
        width: 1200,
        height: 630,
        alt: "Bahmad Perfumes Luxury Collection",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter/X Preview
  twitter: {
    card: "summary_large_image",
    title: "Bahmad Perfumes",
    description: "Luxury Fragrances & Home Scents in Tanzania",
    images: ["/og-image.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // SSR setup kwa ajili ya Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let initialLang = 'sw';

  return (
    <html lang={initialLang}>
      <body className={`${playfair.variable} ${lato.variable} font-sans antialiased`}>
        {/* LanguageProvider inafunika kila kitu ili lugha isikike kote */}
        <LanguageProvider initialLang={initialLang as any}>
          <CartProvider>
            {children}
            {/* Toaster kwa ajili ya alerts nzuri (Mfano: "Item added to cart") */}
            <Toaster 
  position="bottom-right" 
  richColors 
  expand={false}
  closeButton
  toastOptions={{
    style: { 
      fontSize: '16px', // Maandishi makubwa zaidi kwa ajili ya User Experience
      padding: '16px',
      fontFamily: 'var(--font-lato)', // Inatumia font ya Lato uliyoset
    },
  }}
/>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}