"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Store = {
  id: string;
  name: string;
  city: string;
  state: string;
  zip_code: string;
};

type Item = {
  id: string;
  name: string;
  category: string | null;
  brand: string | null;
  unit: string | null;
};

export default function SubmitPricePage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    const loadUserAndData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsAuthenticated(false);
        setUserId(null);
        setCheckingAuth(false);
        return;
      }

      setIsAuthenticated(true);
      setUserId(user.id);

      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id, name, city, state, zip_code")
        .eq("active", true)
        .order("name", { ascending: true });

      const { data: itemData, error: itemError } = await supabase
        .from("items")
        .select("id, name, category, brand, unit")
        .eq("active", true)
        .order("name", { ascending: true });

      if (storeError || itemError) {
        setMessage("Failed to load stores or items.");
        setMessageType("error");
        setCheckingAuth(false);
        return;
      }

      setStores(storeData || []);
      setItems(itemData || []);
      setCheckingAuth(false);
    };

    loadUserAndData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;

      if (!user) {
        setIsAuthenticated(false);
        setUserId(null);
        setStores([]);
        setItems([]);
        setCheckingAuth(false);
        return;
      }

      setIsAuthenticated(true);
      setUserId(user.id);

      const { data: storeData } = await supabase
        .from("stores")
        .select("id, name, city, state, zip_code")
        .eq("active", true)
        .order("name", { ascending: true });

      const { data: itemData } = await supabase
        .from("items")
        .select("id, name, category, brand, unit")
        .eq("active", true)
        .order("name", { ascending: true });

      setStores(storeData || []);
      setItems(itemData || []);
      setCheckingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!isAuthenticated || !userId) {
      setMessage("You must be signed in to submit a price.");
      setMessageType("error");
      return;
    }

    if (!selectedStore || !selectedItem || !price) {
      setMessage("Please fill out store, item, and price.");
      setMessageType("error");
      return;
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      setMessage("Please enter a valid price.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    const { error: submissionError } = await supabase
      .from("price_submissions")
      .insert({
        user_id: userId,
        store_id: selectedStore,
        item_id: selectedItem,
        price: numericPrice,
        submission_type: "manual",
        notes: notes || null,
      });

    if (submissionError) {
      setMessage(submissionError.message || "Failed to submit price.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    const { error: rewardError } = await supabase
      .from("reward_transactions")
      .insert({
        user_id: userId,
        type: "price_submission",
        points: 2,
        description: "Submitted a new grocery price",
      });

    if (rewardError) {
      setMessage(
        "Price submitted, but reward points could not be added yet."
      );
      setMessageType("error");
      setLoading(false);
      return;
    }

    setMessage("Price submitted successfully. You earned 2 points.");
    setMessageType("success");
    setSelectedStore("");
    setSelectedItem("");
    setPrice("");
    setNotes("");
    setLoading(false);
  };

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-gray-100 text-gray-900 p-6">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-md">
          <h1 className="text-3xl font-bold text-slate-900">Submit a Price</h1>
          <p className="mt-2 text-slate-600">Checking your account...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-100 text-gray-900 p-6">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-md">
          <h1 className="text-3xl font-bold text-slate-900">Submit a Price</h1>
          <p className="mt-2 text-slate-600">
            You need to log in before you can submit grocery prices.
          </p>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            Price submissions are only available to signed-in users so PriceCart
            can track updates and reward points correctly.
          </div>

          <div className="mt-6 flex gap-3">
            <Link
              href="/login"
              className="rounded-lg bg-black px-4 py-3 text-sm font-medium text-white"
            >
              Log In / Sign Up
            </Link>

            <Link
              href="/"
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-900"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-md">
        <h1 className="text-3xl font-bold text-slate-900">Submit a Price</h1>
        <p className="mt-2 text-slate-600">
          Help keep PriceCart accurate by submitting a grocery price update.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">
              Store
            </label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full rounded-lg border bg-white px-3 py-2 text-black"
            >
              <option value="">Select a store</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name} — {store.city}, {store.state} {store.zip_code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">
              Item
            </label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full rounded-lg border bg-white px-3 py-2 text-black"
            >
              <option value="">Select an item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.unit ? ` — ${item.unit}` : ""}
                  {item.category ? ` — ${item.category}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="3.29"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border bg-white px-3 py-2 text-black placeholder-gray-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">
              Notes (optional)
            </label>
            <textarea
              rows={3}
              placeholder="Example: shelf price, sale tag, or brand detail"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border bg-white px-3 py-2 text-black placeholder-gray-400"
            />
          </div>

          {message && (
            <div
              className={`rounded-lg px-3 py-2 text-sm ${
                messageType === "success"
                  ? "border border-green-200 bg-green-50 text-green-700"
                  : "border border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black py-3 text-white font-medium disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Price"}
          </button>
        </form>
      </div>
    </main>
  );
}