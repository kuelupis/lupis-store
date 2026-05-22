"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

const ADMIN_EMAIL = "haspogaming8@gmail.com";

export default function AdminPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data } = await supabase.auth.getUser();

    if (!data.user || data.user.email !== ADMIN_EMAIL) {
      alert("Akses ditolak");
      window.location.href = "/";
      return;
    }

    loadOrders();
  }

  async function loadOrders() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false });

    setOrders(data || []);
  }

  async function updateStatus(id, status) {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      loadOrders();
    }
  }

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      process: orders.filter((o) => o.status === "process").length,
      done: orders.filter((o) => o.status === "done").length,
    };
  }, [orders]);

  function statusColor(status) {
    if (status === "paid") return "bg-blue-100 text-blue-700";
    if (status === "process") return "bg-yellow-100 text-yellow-700";
    if (status === "done") return "bg-green-100 text-green-700";
    if (status === "cancel") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  }

  return (
    <main className="min-h-screen bg-[#eef4ff] p-6">
      <div className="max-w-7xl mx-auto">

        <div className="bg-gradient-to-r from-[#0b4fd8] to-[#5865F2] text-white rounded-[32px] p-8 shadow-xl mb-8">
          <p className="text-white/70 font-bold">
            LupiszStore
          </p>

          <h1 className="text-4xl font-black mt-2">
            Admin Dashboard
          </h1>

          <p className="text-white/80 mt-2">
            Kelola order customer dan chat admin.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          <div className="bg-white rounded-[28px] p-6 shadow">
            <p className="text-slate-500 font-bold">
              Total Order
            </p>

            <h2 className="text-4xl font-black mt-3 text-[#0b4fd8]">
              {stats.total}
            </h2>
          </div>

          <div className="bg-white rounded-[28px] p-6 shadow">
            <p className="text-slate-500 font-bold">
              Pending
            </p>

            <h2 className="text-4xl font-black mt-3 text-gray-500">
              {stats.pending}
            </h2>
          </div>

          <div className="bg-white rounded-[28px] p-6 shadow">
            <p className="text-slate-500 font-bold">
              Process
            </p>

            <h2 className="text-4xl font-black mt-3 text-yellow-500">
              {stats.process}
            </h2>
          </div>

          <div className="bg-white rounded-[28px] p-6 shadow">
            <p className="text-slate-500 font-bold">
              Done
            </p>

            <h2 className="text-4xl font-black mt-3 text-green-500">
              {stats.done}
            </h2>
          </div>

        </div>

        <div className="grid gap-6">

          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-[30px] shadow-xl border border-blue-50 p-6"
            >
              <div className="flex flex-col lg:flex-row gap-6 justify-between">

                <div className="flex-1">

                  <div className="flex flex-wrap gap-3 items-center mb-3">

                    <p className="text-sm text-slate-500">
                      Order #{order.id}
                    </p>

                    <span
                      className={`px-4 py-2 rounded-xl font-bold text-sm ${statusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                  </div>

                  <h2 className="text-3xl font-black">
                    {order.product_name}
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4 mt-5">

                    <div className="bg-blue-50 rounded-2xl p-4">
                      <p className="text-slate-500 text-sm">
                        Username Roblox
                      </p>

                      <p className="font-black text-lg">
                        {order.roblox_username}
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-4">
                      <p className="text-slate-500 text-sm">
                        Display Name
                      </p>

                      <p className="font-black text-lg">
                        {order.roblox_display}
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-4">
                      <p className="text-slate-500 text-sm">
                        Payment
                      </p>

                      <p className="font-black text-lg">
                        {order.payment_method}
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-4">
                      <p className="text-slate-500 text-sm">
                        Tanggal
                      </p>

                      <p className="font-black text-lg">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString("id-ID")
                          : "-"}
                      </p>
                    </div>

                  </div>

                  <div className="flex flex-wrap gap-3 mt-6">

                    <button
                      onClick={() => updateStatus(order.id, "pending")}
                      className="bg-gray-500 text-white px-5 py-3 rounded-2xl font-bold"
                    >
                      Pending
                    </button>

                    <button
                      onClick={() => updateStatus(order.id, "paid")}
                      className="bg-blue-500 text-white px-5 py-3 rounded-2xl font-bold"
                    >
                      Paid
                    </button>

                    <button
                      onClick={() => updateStatus(order.id, "process")}
                      className="bg-yellow-500 text-white px-5 py-3 rounded-2xl font-bold"
                    >
                      Process
                    </button>

                    <button
                      onClick={() => updateStatus(order.id, "done")}
                      className="bg-green-500 text-white px-5 py-3 rounded-2xl font-bold"
                    >
                      Done
                    </button>

                    <button
                      onClick={() => updateStatus(order.id, "cancel")}
                      className="bg-red-500 text-white px-5 py-3 rounded-2xl font-bold"
                    >
                      Cancel
                    </button>

                  </div>

                </div>

                <div className="w-full lg:w-[300px]">

                  {order.payment_proof ? (
                    <div className="bg-slate-50 rounded-[28px] p-4 border">

                      <p className="font-black mb-3">
                        Bukti Transfer
                      </p>

                      <img
                        src={order.payment_proof}
                        alt="Bukti Transfer"
                        className="rounded-2xl border shadow"
                      />

                      <a
                        href={order.payment_proof}
                        target="_blank"
                        className="block mt-4 text-center bg-[#0b4fd8] text-white py-3 rounded-2xl font-bold"
                      >
                        Lihat Full
                      </a>

                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-[28px] p-6 text-center border">
                      <p className="text-slate-500 font-bold">
                        Tidak ada bukti transfer
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() =>
                      (window.location.href = `/admin-chat?order=${order.id}`)
                    }
                    className="w-full mt-4 bg-[#5865F2] hover:bg-[#4752d6] text-white py-4 rounded-[24px] font-black shadow-lg"
                  >
                    Buka Chat Customer
                  </button>

                </div>

              </div>
            </div>
          ))}

        </div>
      </div>
    </main>
  );
}