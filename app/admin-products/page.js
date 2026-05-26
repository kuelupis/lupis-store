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
  const [imageFile, setImageFile] = useState(null);

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
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    setProducts(data || []);
  }

  async function uploadProductImage() {
    if (!imageFile) return imageUrl;

    const fileName = `${Date.now()}-${imageFile.name}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, imageFile);

    if (error) {
      alert(error.message);
      return "";
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setPrice("");
    setCategory("");
    setDescription("");
    setImageUrl("");
    setImageFile(null);
  }

  async function saveProduct() {
    if (!name || !price) {
      alert("Nama produk dan harga wajib diisi");
      return;
    }

    const finalImageUrl = await uploadProductImage();

    const productData = {
      name,
      price,
      category,
      description,
      image_url: finalImageUrl,
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
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteProduct(id) {
    if (!confirm("Yakin mau hapus produk ini?")) return;

    await supabase.from("products").delete().eq("id", id);
    loadProducts();
  }

  return (
    <main className="min-h-screen bg-[#eef4ff] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#0b4fd8] to-[#5865F2] text-white rounded-[32px] p-8 shadow-xl mb-8">
          <p className="text-white/70 font-bold">LupiszStore</p>
          <h1 className="text-4xl font-black mt-2">Admin Products</h1>
          <p className="text-white/80 mt-2">
            Tambah, edit, dan hapus produk store.
          </p>
        </div>

        <div className="bg-white rounded-[32px] shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-black mb-5">
            {editingId ? "Edit Produk" : "Tambah Produk"}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              value={name}
              placeholder="Nama Produk"
              className="border border-blue-100 bg-blue-50 p-4 rounded-2xl outline-none"
              onChange={(e) => setName(e.target.value)}
            />

            <input
              value={price}
              placeholder="Harga, contoh Rp10.000"
              className="border border-blue-100 bg-blue-50 p-4 rounded-2xl outline-none"
              onChange={(e) => setPrice(e.target.value)}
            />

            <input
              value={category}
              placeholder="Kategori"
              className="border border-blue-100 bg-blue-50 p-4 rounded-2xl outline-none"
              onChange={(e) => setCategory(e.target.value)}
            />

            <label className="border-2 border-dashed border-blue-200 bg-blue-50 p-4 rounded-2xl cursor-pointer text-[#0b4fd8] font-bold">
              {imageFile ? imageFile.name : "Upload Gambar Produk"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </label>

            <textarea
              value={description}
              placeholder="Deskripsi produk"
              className="md:col-span-2 border border-blue-100 bg-blue-50 p-4 rounded-2xl outline-none h-28"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {imageUrl && !imageFile && (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-48 h-32 object-cover rounded-2xl border mt-5"
            />
          )}

          {imageFile && (
            <p className="mt-4 text-green-600 font-bold">
              Gambar dipilih: {imageFile.name}
            </p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={saveProduct}
              className="bg-[#0b4fd8] text-white px-6 py-3 rounded-2xl font-black"
            >
              {editingId ? "Update Produk" : "Tambah Produk"}
            </button>

            {editingId && (
              <button
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-3 rounded-2xl font-black"
              >
                Batal Edit
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-[28px] shadow p-5">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-2xl mb-4"
                />
              )}

              <p className="text-sm text-slate-500">{product.category}</p>
              <h2 className="text-xl font-black">{product.name}</h2>
              <p className="text-[#0b4fd8] font-black">{product.price}</p>
              <p className="text-slate-600 mt-2">{product.description}</p>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => editProduct(product)}
                  className="bg-yellow-500 text-white px-5 py-2 rounded-xl font-bold"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteProduct(product.id)}
                  className="bg-red-500 text-white px-5 py-2 rounded-xl font-bold"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}