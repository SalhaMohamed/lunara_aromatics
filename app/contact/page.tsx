import Navbar from "@/components/Navbar";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-6 py-20 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif text-[#5B2C6F] mb-4">Get in Touch</h1>
          <p className="text-stone-500 italic">We'd love to hear from you. Reach out for any inquiries.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6 text-stone-700">
            <div>
              <h3 className="font-bold text-[#C5A059] uppercase text-xs tracking-widest mb-2">Address</h3>
              <p>Mtaa gani, Tanzania</p>
            </div>
            <div>
              <h3 className="font-bold text-[#C5A059] uppercase text-xs tracking-widest mb-2">Email</h3>
              <p>info@lunara-aromatics.com</p>
            </div>
          </div>
          <form className="space-y-4">
            <input type="text" placeholder="Name" className="w-full p-3 border border-stone-200 outline-none focus:border-[#5B2C6F]" />
            <input type="email" placeholder="Email" className="w-full p-3 border border-stone-200 outline-none focus:border-[#5B2C6F]" />
            <textarea placeholder="Message" rows={4} className="w-full p-3 border border-stone-200 outline-none focus:border-[#5B2C6F]"></textarea>
            <button className="bg-[#5B2C6F] text-white px-8 py-3 w-full uppercase text-xs font-bold tracking-widest hover:bg-[#4A235A]">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}