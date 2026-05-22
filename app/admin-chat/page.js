"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const ADMIN_EMAIL = "haspogaming8@gmail.com";

export default function AdminChatPage() {
  const [orderId, setOrderId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [customerTyping, setCustomerTyping] = useState(false);

  useEffect(() => {
    setupAdminChat();
  }, []);

  async function setupAdminChat() {
    const { data } = await supabase.auth.getUser();

    if (!data.user || data.user.email !== ADMIN_EMAIL) {
      alert("Akses ditolak");
      window.location.href = "/";
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const order = params.get("order");

    if (!order) {
      alert("Order tidak ditemukan");
      window.location.href = "/admin";
      return;
    }

    setOrderId(order);
    loadMessages(order);
    loadTyping(order);

    const interval = setInterval(() => {
      loadMessages(order);
      loadTyping(order);
    }, 1000);

    return () => clearInterval(interval);
  }

  async function loadMessages(order) {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("order_id", Number(order))
      .order("created_at", { ascending: true });

    setMessages(data || []);
  }

  async function loadTyping(order) {
    const { data } = await supabase
      .from("typing_status")
      .select("*")
      .eq("order_id", Number(order))
      .eq("user_role", "customer")
      .order("updated_at", { ascending: false })
      .limit(1);

    setCustomerTyping(data?.[0]?.is_typing || false);
  }

  async function updateTyping(value) {
    if (!orderId) return;

    await supabase.from("typing_status").insert([
      {
        order_id: Number(orderId),
        user_role: "admin",
        is_typing: value,
        updated_at: new Date().toISOString(),
      },
    ]);
  }

  async function sendMessage() {
    if (!message.trim()) return;

    const text = message;
    setMessage("");
    updateTyping(false);

    await supabase.from("messages").insert([
      {
        order_id: Number(orderId),
        sender_id: null,
        sender_role: "admin",
        message: text,
      },
    ]);

    loadMessages(orderId);
  }

  return (
    <main className="min-h-screen bg-[#eef4ff] p-5">
      <div className="max-w-4xl mx-auto bg-white rounded-[32px] shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#5865F2] to-[#0b4fd8] text-white p-6 flex justify-between items-center">
          <div>
            <p className="text-white/70 text-sm">Admin Panel</p>
            <h1 className="text-3xl font-black">Admin Chat</h1>
            <p className="text-white/80 text-sm mt-1">Order ID: {orderId}</p>
          </div>

          <a
            href="/admin"
            className="bg-white text-[#0b4fd8] px-4 py-2 rounded-xl font-bold"
          >
            Dashboard
          </a>
        </div>

        <div className="h-[470px] overflow-y-auto bg-slate-50 p-6">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 font-bold">
              Belum ada pesan dari customer.
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-4 flex ${
                  msg.sender_role === "admin" ? "justify-end" : "justify-start"
                }`}
              >
                <div>
                  <p
                    className={`text-xs mb-1 ${
                      msg.sender_role === "admin"
                        ? "text-right text-[#0b4fd8]"
                        : "text-left text-slate-500"
                    }`}
                  >
                    {msg.sender_role === "admin" ? "Admin" : "Customer"}
                  </p>

                  <div
                    className={`px-5 py-3 rounded-3xl max-w-[280px] sm:max-w-[420px] shadow ${
                      msg.sender_role === "admin"
                        ? "bg-[#0b4fd8] text-white rounded-br-md"
                        : "bg-white text-slate-800 rounded-bl-md border"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            ))
          )}

          {customerTyping && (
            <p className="text-sm text-slate-500 font-bold">
              Customer sedang mengetik...
            </p>
          )}
        </div>

        <div className="p-5 bg-white border-t flex gap-3">
          <input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              updateTyping(e.target.value.length > 0);
            }}
            onBlur={() => updateTyping(false)}
            placeholder="Balas customer..."
            className="flex-1 bg-blue-50 border border-blue-100 p-4 rounded-2xl outline-none"
          />

          <button
            onClick={sendMessage}
            className="bg-[#0b4fd8] hover:bg-blue-700 text-white px-6 rounded-2xl font-black"
          >
            Kirim
          </button>
        </div>
      </div>
    </main>
  );
}