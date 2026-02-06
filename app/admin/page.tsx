"use client";
import { useState } from "react";
import { Plus, Package, Users, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#5B2C6F] text-white p-6 space-y-8">
        <h2 className="text-2xl font-serif font-bold italic">Lunara Admin</h2>
        <nav className="space-y-4">
          <div className="flex items-center gap-3 p-2 bg-white/10 rounded cursor-pointer"><BarChart3 size={18}/> Overview</div>
          <div className="flex items-center gap-3 p-2 hover:bg-white/10 rounded cursor-pointer"><Package size={18}/> Products</div>
          <div className="flex items-center gap-3 p-2 hover:bg-white/10 rounded cursor-pointer"><Users size={18}/> Customers</div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-bold text-stone-800">Product Management</h1>
          <button className="bg-[#C5A059] text-white px-6 py-2 rounded flex items-center gap-2 hover:shadow-lg transition">
            <Plus size={18}/> Add New Product
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 shadow-sm border border-stone-100 rounded">
            <p className="text-stone-400 text-sm">Total Sales</p>
            <h3 className="text-2xl font-bold">TZS 1,250,000</h3>
          </div>
          <div className="bg-white p-6 shadow-sm border border-stone-100 rounded">
            <p className="text-stone-400 text-sm">Active Orders</p>
            <h3 className="text-2xl font-bold">12</h3>
          </div>
          <div className="bg-white p-6 shadow-sm border border-stone-100 rounded">
            <p className="text-stone-400 text-sm">Total Products</p>
            <h3 className="text-2xl font-bold">45</h3>
          </div>
        </div>

        {/* Product Table placeholder */}
        <div className="bg-white shadow-sm border border-stone-100 rounded overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="p-4 text-xs font-bold uppercase text-stone-500">Product</th>
                <th className="p-4 text-xs font-bold uppercase text-stone-500">Category</th>
                <th className="p-4 text-xs font-bold uppercase text-stone-500">Price</th>
                <th className="p-4 text-xs font-bold uppercase text-stone-500">Stock</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stone-50">
                <td className="p-4 text-sm">Oud Royale</td>
                <td className="p-4 text-sm text-stone-400">Perfume</td>
                <td className="p-4 text-sm font-bold">TZS 85,000</td>
                <td className="p-4 text-sm text-green-600 font-bold">In Stock</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}