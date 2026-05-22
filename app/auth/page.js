"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function register() {
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
    } else {
      alert("Register berhasil! Kalau diminta verifikasi, cek email.");
    }
  }

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === "Email not confirmed") {
        alert("Silahkan cek email anda");
      } else {
        alert(error.message);
      }
    } else {
      alert("Login berhasil!");
      window.location.href = "/";
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] flex items-center justify-center">
      <div className="bg-white p-8 rounded-3xl shadow w-[400px]">
        <h1 className="text-3xl font-bold text-[#0b4fd8] text-center mb-6">
          LupiszStore
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded-xl mb-3"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-xl mb-5"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login} className="w-full bg-[#0b4fd8] text-white py-3 rounded-xl mb-3">
          Login
        </button>

        <button onClick={register} className="w-full bg-gray-800 text-white py-3 rounded-xl">
          Register
        </button>
      </div>
    </main>
  );
}