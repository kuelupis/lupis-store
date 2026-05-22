"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function OrderPage() {
  const [user, setUser] = useState(null);
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [privateServer, setPrivateServer] = useState("");
  const [payment, setPayment] = useState("QRIS");
  const [proofFile, setProofFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        alert("Login dulu untuk order");
        window.location.href = "/auth";
        return;
      }

      setUser(data.user);

      const params = new URLSearchParams(window.location.search);

      setProduct(params.get("product") || "");
      setPrice(params.get("price") || "");
    }

    checkUser();
  }, []);

  async function uploadProof() {
    if (!proofFile) return "";

    const fileName = `${Date.now()}-${proofFile.name}`;

    const { error } = await supabase.storage
      .from("payment-proofs")
      .upload(fileName, proofFile);

    if (error) {
      alert(error.message);
      return "";
    }

    const { data } = supabase.storage
      .from("payment-proofs")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function submitOrder() {
    if (!user) {
      alert("Login dulu");
      return;
    }

    if (!username || !displayName) {
      alert("Lengkapi data Roblox");
      return;
    }

    if (!proofFile) {
      alert("Upload bukti transfer dulu");
      return;
    }

    setLoading(true);

    const proofUrl = await uploadProof();

    if (!proofUrl) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          user_id: user.id,
          product_name: product,
          roblox_username: username,
          roblox_display: displayName,
          private_server: privateServer,
          payment_method: payment,
          payment_proof: proofUrl,
          status: "pending",
        },
      ])
      .select();

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      window.location.href = `/chat?order=${data[0].id}`;
    }
  }

  return (
    <main className="min-h-screen bg-[#eef4ff] p-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-[32px] shadow-xl p-8 h-fit">

          <p className="text-[#0b4fd8] font-bold mb-2">
            FORM ORDER
          </p>

          <h1 className="text-4xl font-black">
            {product}
          </h1>

          <p className="text-3xl font-black text-[#0b4fd8] mt-3">
            {price}
          </p>

          <div className="mt-8 space-y-4">

            <input
              placeholder="Username Roblox"
              className="w-full border border-blue-100 bg-blue-50 p-4 rounded-2xl outline-none focus:border-[#0b4fd8]"
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              placeholder="Display Name Roblox"
              className="w-full border border-blue-100 bg-blue-50 p-4 rounded-2xl outline-none focus:border-[#0b4fd8]"
              onChange={(e) => setDisplayName(e.target.value)}
            />

            <input
              placeholder="Private Server (Opsional)"
              className="w-full border border-blue-100 bg-blue-50 p-4 rounded-2xl outline-none focus:border-[#0b4fd8]"
              onChange={(e) => setPrivateServer(e.target.value)}
            />

          </div>
        </div>

        <div className="space-y-6">

          <div className="bg-white rounded-[32px] shadow-xl p-8">

            <h2 className="text-2xl font-black mb-5">
              Payment Method
            </h2>

            <select
              className="w-full border border-blue-100 bg-blue-50 p-4 rounded-2xl outline-none mb-6"
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
            >
              <option value="QRIS">QRIS</option>
              <option value="DANA">DANA</option>
              <option value="GOPAY">GOPAY</option>
            </select>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-[28px] p-6">

              {payment === "QRIS" && (
                <div className="text-center">
                  <p className="font-black text-[#0b4fd8] text-lg mb-4">
                    Scan QRIS Untuk Pembayaran
                  </p>

                  <img
                    src="/qris.png"
                    alt="QRIS"
                    className="w-72 rounded-3xl border mx-auto shadow"
                  />
                </div>
              )}

              {payment === "DANA" && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">
                    Nomor DANA
                  </p>

                  <p className="text-3xl font-black text-[#0b4fd8]">
                    083894453655
                  </p>
                </div>
              )}

              {payment === "GOPAY" && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">
                    Nomor GOPAY
                  </p>

                  <p className="text-3xl font-black text-[#0b4fd8]">
                    083894453655
                  </p>
                </div>
              )}

              <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4">
                <p className="text-red-500 font-bold text-center">
                  JANGAN LUPA SCREENSHOT BUKTI TRANSFER
                </p>
              </div>

            </div>
          </div>

          <div className="bg-white rounded-[32px] shadow-xl p-8">

            <h2 className="text-2xl font-black mb-5">
              Upload Bukti Transfer
            </h2>

            <label className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-[28px] p-8 flex flex-col items-center justify-center cursor-pointer text-center">

              <p className="font-bold text-[#0b4fd8]">
                Klik untuk upload gambar
              </p>

              <p className="text-sm text-slate-500 mt-2">
                PNG / JPG / JPEG
              </p>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setProofFile(e.target.files[0])}
              />
            </label>

            {proofFile && (
              <p className="mt-4 text-sm text-green-600 font-bold">
                File dipilih: {proofFile.name}
              </p>
            )}

            <button
              onClick={submitOrder}
              disabled={loading}
              className="w-full mt-8 bg-[#0b4fd8] hover:bg-blue-700 text-white py-4 rounded-[24px] font-black text-lg shadow-xl"
            >
              {loading ? "MEMBUAT ORDER..." : "BUAT ORDER"}
            </button>

          </div>

        </div>

      </div>
    </main>
  );
}