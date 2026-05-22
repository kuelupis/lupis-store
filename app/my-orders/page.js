"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      alert("Login dulu");
      window.location.href = "/auth";
      return;
    }

    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("id", { ascending: false });

    setOrders(data || []);
  }

  function statusColor(status) {
    if (status === "paid") return "bg-blue-100 text-blue-700";
    if (status === "process") return "bg-yellow-100 text-yellow-700";
    if (status === "done") return "bg-green-100 text-green-700";
    if (status === "cancel") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  }

  return (
    <main className="min-h-screen bg-[#eef4ff] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-[#0b4fd8] to-[#5865F2] text-white rounded-[32px] p-8 mb-8 shadow-xl">
          <p className="text-white/70 font-bold">LupiszStore</p>
          <h1 className="text-4xl font-black mt-2">My Orders</h1>
          <p className="text-white/80 mt-2">
            Cek status pesanan dan buka kembali chat admin.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[28px] p-8 text-center shadow">
            <p className="text-slate-500 font-bold">
              Kamu belum punya order.
            </p>

            <a
              href="/"
              className="inline-block mt-5 bg-[#0b4fd8] text-white px-6 py-3 rounded-2xl font-bold"
            >
              Lihat Produk
            </a>
          </div>
        ) : (
          <div className="grid gap-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-[28px] shadow p-6 border border-blue-50"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">
                      Order #{order.id}
                    </p>

                    <h2 className="text-2xl font-black">
                      {order.product_name}
                    </h2>

                    <p className="text-slate-500 mt-1">
                      Payment: {order.payment_method}
                    </p>

                    <p className="text-slate-500">
                      Tanggal:{" "}
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString("id-ID")
                        : "-"}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <span
                      className={`px-4 py-2 rounded-xl font-bold text-center ${statusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                    <button
                      onClick={() =>
                        (window.location.href = `/chat?order=${order.id}`)
                      }
                      className="bg-[#0b4fd8] text-white px-5 py-2 rounded-xl font-bold"
                    >
                      Buka Chat
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}