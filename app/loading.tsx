export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#1a1510] z-[100] flex flex-col items-center justify-center">
      <div className="animate-pulse">
        <h1 className="text-4xl font-serif text-[#C5A059] italic tracking-[0.2em]">BAHMAD PERFUMES</h1>
      </div>
      <div className="mt-4 w-24 h-[1px] bg-[#C5A059]/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#C5A059] animate-loading-bar"></div>
      </div>
    </div>
  );
}