"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ChatPage() {
  const [user, setUser] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [adminTyping, setAdminTyping] = useState(false);

  useEffect(() => {
    async function setupChat() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        alert("Login dulu untuk chat");
        window.location.href = "/auth";
        return;
      }

      setUser(userData.user);

      const params = new URLSearchParams(window.location.search);
      const order = params.get("order");

      if (!order) {
        alert("Order tidak ditemukan");
        window.location.href = "/my-orders";
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

    setupChat();
  }, []);

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
      .eq("user_role", "admin")
      .order("updated_at", { ascending: false })
      .limit(1);

    setAdminTyping(data?.[0]?.is_typing || false);
  }

  async function updateTyping(value) {
    if (!orderId) return;

    await supabase.from("typing_status").insert([
      {
        order_id: Number(orderId),
        user_role: "customer",
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
        sender_id: user.id,
        sender_role: "customer",
        message: text,
      },
    ]);

    loadMessages(orderId);
  }

  return (
    <main className="min-h-screen bg-[#eef4ff] p-5">
      <div className="max-w-4xl mx-auto bg-white rounded-[32px] shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#0b4fd8] to-[#5865F2] text-white p-6 flex justify-between items-center">
          <div>
            <p className="text-white/70 text-sm">Customer Chat</p>
            <h1 className="text-3xl font-black">Chat Admin</h1>
            <p className="text-white/80 text-sm mt-1">Order ID: {orderId}</p>
          </div>

          <a
            href="/my-orders"
            className="bg-white text-[#0b4fd8] px-4 py-2 rounded-xl font-bold"
          >
            My Orders
          </a>
        </div>

        <div className="h-[470px] overflow-y-auto bg-slate-50 p-6">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 font-bold">
              Belum ada pesan. Mulai chat dengan admin.
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-4 flex ${
                  msg.sender_role === "customer" ? "justify-end" : "justify-start"
                }`}
              >
                <div>
                  <p
                    className={`text-xs mb-1 ${
                      msg.sender_role === "customer"
                        ? "text-right text-[#0b4fd8]"
                        : "text-left text-slate-500"
                    }`}
                  >
                    {msg.sender_role === "customer" ? "Kamu" : "Admin"}
                  </p>

                  <div
                    className={`px-5 py-3 rounded-3xl max-w-[280px] sm:max-w-[420px] shadow ${
                      msg.sender_role === "customer"
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

          {adminTyping && (
            <p className="text-sm text-slate-500 font-bold">
              Admin sedang mengetik...
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
            placeholder="Ketik pesan..."
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