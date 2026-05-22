"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ReviewPage() {
  const [user, setUser] = useState(null);
  const [product, setProduct] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        alert("Login dulu");
        window.location.href = "/auth";
        return;
      }

      setUser(data.user);

      const params = new URLSearchParams(window.location.search);
      setProduct(params.get("product") || "");
    }

    load();
  }, []);

  async function submitReview() {
    if (!review) {
      alert("Isi review dulu");
      return;
    }

    const { error } = await supabase.from("reviews").insert([
      {
        user_id: user.id,
        product_name: product,
        rating,
        review,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      alert("Review berhasil dikirim!");
      window.location.href = "/my-orders";
    }
  }

  return (
    <main className="min-h-screen bg-[#eef4ff] flex items-center justify-center p-6">
      <div className="bg-white rounded-[32px] shadow-xl p-8 w-full max-w-xl">
        <p className="text-[#0b4fd8] font-bold">REVIEW</p>

        <h1 className="text-3xl font-black mt-2">
          {product}
        </h1>

        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full border bg-blue-50 p-4 rounded-2xl mt-6 mb-4"
        >
          <option value={5}>⭐⭐⭐⭐⭐ 5 Bintang</option>
          <option value={4}>⭐⭐⭐⭐ 4 Bintang</option>
          <option value={3}>⭐⭐⭐ 3 Bintang</option>
          <option value={2}>⭐⭐ 2 Bintang</option>
          <option value={1}>⭐ 1 Bintang</option>
        </select>

        <textarea
          placeholder="Tulis review kamu..."
          className="w-full border bg-blue-50 p-4 rounded-2xl h-36 mb-5"
          onChange={(e) => setReview(e.target.value)}
        />

        <button
          onClick={submitReview}
          className="w-full bg-[#0b4fd8] text-white py-4 rounded-2xl font-black"
        >
          Kirim Review
        </button>
      </div>
    </main>
  );
}