"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const ADMIN_EMAIL = "haspogaming8@gmail.com";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

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

    loadProducts();
  }

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (!error) setProducts(data || []);
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setPrice("");
    setCategory("");
    setDescription("");
    setImageUrl("");
  }

  async function saveProduct() {
    if (!name || !price) {
      alert("Nama produk dan harga wajib diisi");
      return;
    }

    const productData = {
      name,
      price,
      category,
      description,
      image_url: imageUrl,
    };

    const { error } = editingId
      ? await supabase.from("products").update(productData).eq("id", editingId)
      : await supabase.from("products").insert([productData]);

    if (error) {
      alert(error.message);
    } else {
      alert(editingId ? "Produk berhasil diupdate" : "Produk berhasil ditambahkan");
      resetForm();
      loadProducts();
    }
  }

  function editProduct(product) {
    setEditingId(product.id);
    setName(product.name || "");
    setPrice(product.price || "");
    setCategory(product.category || "");
    setDescription(product.description || "");
    setImageUrl(product.image_url || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteProduct(id) {
    if (!confirm("Yakin mau hapus produk ini?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) alert(error.message);
    else loadProducts();
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] p-8">
      <h1 className="text-4xl font-bold text-[#0b4fd8] mb-8">
        Admin Products
      </h1>

      <div className="bg-white rounded-3xl shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-5">
          {editingId ? "Edit Produk" : "Tambah Produk"}
        </h2>

        <input value={name} placeholder="Nama Produk" className="w-full border p-3 rounded-xl mb-3" onChange={(e) => setName(e.target.value)} />
        <input value={price} placeholder="Harga, contoh Rp10.000" className="w-full border p-3 rounded-xl mb-3" onChange={(e) => setPrice(e.target.value)} />
        <input value={category} placeholder="Kategori" className="w-full border p-3 rounded-xl mb-3" onChange={(e) => setCategory(e.target.value)} />
        <input value={imageUrl} placeholder="Image URL / link gambar" className="w-full border p-3 rounded-xl mb-3" onChange={(e) => setImageUrl(e.target.value)} />
        <textarea value={description} placeholder="Deskripsi produk" className="w-full border p-3 rounded-xl mb-5" onChange={(e) => setDescription(e.target.value)} />

        <div className="flex gap-3">
          <button onClick={saveProduct} className="bg-[#0b4fd8] text-white px-6 py-3 rounded-xl font-bold">
            {editingId ? "Update Produk" : "Tambah Produk"}
          </button>

          {editingId && (
            <button onClick={resetForm} className="bg-gray-500 text-white px-6 py-3 rounded-xl font-bold">
              Batal Edit
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-3xl shadow p-5">
            {product.image_url && (
              <img src={product.image_url} alt={product.name} className="w-full h-40 object-cover rounded-2xl mb-4" />
            )}

            <p className="text-sm text-gray-500">{product.category}</p>
            <h2 className="text-xl font-bold">{product.name}</h2>
            <p className="text-[#0b4fd8] font-bold">{product.price}</p>
            <p className="text-gray-600 mt-2">{product.description}</p>

            <div className="flex gap-2 mt-5">
              <button onClick={() => editProduct(product)} className="bg-yellow-500 text-white px-5 py-2 rounded-xl">Edit</button>
              <button onClick={() => deleteProduct(product.id)} className="bg-red-500 text-white px-5 py-2 rounded-xl">Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}