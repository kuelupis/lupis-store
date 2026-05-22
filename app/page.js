"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function Home() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getUser();
    loadProducts();
  }, []);

  async function getUser() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  }

  async function loadProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    setProducts(data || []);
  }

  function orderProduct(product) {
    if (!user) {
      alert("Login/Register dulu untuk order");
      window.location.href = "/auth";
      return;
    }

    window.location.href = `/order?product=${encodeURIComponent(
      product.name
    )}&price=${encodeURIComponent(product.price)}`;
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <main className="min-h-screen bg-[#eef4ff] text-slate-900">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-[#0b4fd8]">
              LupiszStore
            </h1>

            <p className="text-xs text-slate-500">
              Digital Roblox Marketplace
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/my-orders"
              className="hidden sm:block bg-blue-50 text-[#0b4fd8] px-4 py-2 rounded-xl font-bold"
            >
              My Orders
            </a>

            {user ? (
              <>
                <span className="hidden md:block text-sm bg-slate-100 px-3 py-2 rounded-xl">
                  {user.email}
                </span>

                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="bg-[#0b4fd8] text-white px-5 py-2 rounded-xl font-bold shadow"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          <div className="lg:col-span-2 bg-gradient-to-br from-[#0b4fd8] via-[#216bff] to-[#7db4ff] text-white rounded-[32px] p-8 shadow-xl overflow-hidden relative">

            <div className="absolute right-[-60px] top-[-60px] w-56 h-56 bg-white/15 rounded-full" />

            <div className="absolute right-20 bottom-[-70px] w-44 h-44 bg-white/10 rounded-full" />

            <p className="font-bold bg-white/20 w-fit px-4 py-2 rounded-full mb-5">
              Fast • Trusted • Friendly
            </p>

            <h2 className="text-4xl md:text-5xl font-black leading-tight">
              LupiszStore Marketplace
            </h2>

            <p className="text-white/85 mt-4 max-w-xl">
              Pilih produk, isi form Roblox, bayar, upload bukti transfer,
              lalu chat langsung dengan admin.
            </p>

            <div className="mt-8">
              <p className="font-bold text-lg mb-4">
                HUBUNGI KAMI
              </p>

              <div className="flex flex-wrap gap-3">

                <a
                  href="https://wa.me/6283894453655"
                  target="_blank"
                  className="bg-[#25D366] hover:bg-[#1ebe5d] text-white px-6 py-3 rounded-2xl font-bold shadow-lg"
                >
                  WhatsApp
                </a>

                <a
                  href="https://discord.com/users/1311661696900927559"
                  target="_blank"
                  className="bg-[#5865F2] hover:bg-[#4752d6] text-white px-6 py-3 rounded-2xl font-bold shadow-lg"
                >
                  Discord
                </a>

              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow">
            <h3 className="text-xl font-black mb-4">
              Kategori
            </h3>

            <div className="grid gap-3">

              {["Blox Fruit", "AOTR", "Joki", "Gamepass"].map((cat) => (
                <div
                  key={cat}
                  className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 font-bold text-[#0b4fd8]"
                >
                  {cat}
                </div>
              ))}

            </div>
          </div>
        </div>

        <div
          id="products"
          className="flex justify-between items-end mb-5"
        >
          <div>
            <p className="text-[#0b4fd8] font-bold">
              Produk
            </p>

            <h2 className="text-3xl font-black">
              Produk Tersedia
            </h2>
          </div>

          <p className="text-sm text-slate-500">
            {products.length} produk
          </p>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow">
            <p className="text-slate-500">
              Belum ada produk.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-[28px] shadow hover:shadow-xl hover:-translate-y-1 duration-300 overflow-hidden border border-blue-50"
              >
                <div className="h-44 bg-gradient-to-br from-blue-100 to-blue-300">

                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-[#0b4fd8] font-black">
                      LupiszStore
                    </div>
                  )}

                </div>

                <div className="p-5">

                  <p className="text-xs font-bold text-[#0b4fd8] bg-blue-50 w-fit px-3 py-1 rounded-full">
                    {product.category || "Product"}
                  </p>

                  <h3 className="text-xl font-black mt-3">
                    {product.name}
                  </h3>

                  <p className="text-slate-500 text-sm mt-2 line-clamp-2">
                    {product.description || "Produk digital LupiszStore"}
                  </p>

                  <div className="flex justify-between items-center mt-5">

                    <p className="text-2xl font-black text-[#0b4fd8]">
                      {product.price}
                    </p>

                    <button
                      onClick={() => orderProduct(product)}
                      className="bg-[#0b4fd8] hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold"
                    >
                      Order
                    </button>

                  </div>
                </div>
              </div>
            ))}

          </div>
        )}
      </section>
    </main>
  );
}