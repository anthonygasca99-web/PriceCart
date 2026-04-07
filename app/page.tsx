"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { illinoisZipCodes } from "../data/illinoisZipCodes";
import { supabase } from "../lib/supabase";

const translations = {
  en: {
    appName: "PriceCart",
    zip: "ZIP Code",
    radius: "Radius",
    search: "Find Stores",
    nearby: "Store Comparison",
    errorZip: "Please enter a ZIP code",
    invalidZip: "ZIP code not found in the Illinois starter database yet",
    groceryList: "Grocery List",
    placeholder: "milk x2, eggs, bread, rice, chicken",
    delivery: "Delivery",
    pickup: "Pickup",
    minDelivery: "Minimum $35 for delivery",
    minPickup: "Minimum $15 for pickup",
    itemBreakdown: "Item breakdown",
    eligibleDelivery: "Eligible for delivery",
    eligiblePickup: "Eligible for pickup",
    smartSplit: "Smart Split Cart",
    smartSplitDesc:
      "PriceCart compares stores near your ZIP code and shows the best option based on your shopping goals.",
    cheapestSingleStore: "Best current option",
    savingsVsSingle: "Savings vs highest total",
    noMatch: "No matching stores found for this ZIP and radius.",
    subtotal: "Subtotal",
    unlockPickup: "Need this much more for pickup",
    unlockDelivery: "Need this much more for delivery",
    optimizeFor: "Optimize for",
    lowestTotal: "Lowest total",
    pickupEligible: "Pickup eligible",
    deliveryEligible: "Delivery eligible",
    inStore: "Shop in person",
    quantity: "Quantity",
    finalCartSummary: "Final Cart Summary",
    totalItems: "Total items",
    totalStores: "Stores found",
    estimatedGrandTotal: "Best total",
    savePreferences: "Save ZIP and Radius",
    savingPreferences: "Saving...",
    saveList: "Save This List",
    savingList: "Saving...",
    signedInAs: "Signed in as",
    notSignedIn: "Not signed in",
    loginSignup: "Log In / Sign Up",
    savedLists: "Saved Lists",
    submitPrice: "Submit Price",
    scanReceipt: "Scan Receipt",
    preferencesSaved: "ZIP code and radius saved successfully.",
    mustBeLoggedInPreferences: "You must be logged in to save preferences.",
    mustBeLoggedInList: "You must be logged in to save a list.",
    enterValidRadius: "Please select a valid radius.",
    listSaved: "List saved successfully.",
    enterAtLeastOneItem: "Please enter at least one item.",
    quickSavedList: "Quick Saved List",
    profileLoading: "Loading profile...",
  },
  es: {
    appName: "PriceCart",
    zip: "Código Postal",
    radius: "Radio",
    search: "Buscar Tiendas",
    nearby: "Comparación de Tiendas",
    errorZip: "Por favor ingresa un código postal",
    invalidZip: "Ese código postal todavía no está en la base inicial de Illinois",
    groceryList: "Lista de Compras",
    placeholder: "leche x2, huevos, pan, arroz, pollo",
    delivery: "Entrega",
    pickup: "Recogida",
    minDelivery: "Mínimo $35 para entrega",
    minPickup: "Mínimo $15 para recogida",
    itemBreakdown: "Desglose de artículos",
    eligibleDelivery: "Califica para entrega",
    eligiblePickup: "Califica para recogida",
    smartSplit: "Carrito Inteligente",
    smartSplitDesc:
      "PriceCart compara tiendas cercanas a tu código postal y muestra la mejor opción según tu meta de compra.",
    cheapestSingleStore: "Mejor opción actual",
    savingsVsSingle: "Ahorro vs el total más alto",
    noMatch: "No se encontraron tiendas para este código postal y radio.",
    subtotal: "Subtotal",
    unlockPickup: "Falta esto para recogida",
    unlockDelivery: "Falta esto para entrega",
    optimizeFor: "Optimizar para",
    lowestTotal: "Menor total",
    pickupEligible: "Recogida elegible",
    deliveryEligible: "Entrega elegible",
    inStore: "Comprar en tienda",
    quantity: "Cantidad",
    finalCartSummary: "Resumen Final del Carrito",
    totalItems: "Artículos totales",
    totalStores: "Tiendas encontradas",
    estimatedGrandTotal: "Mejor total",
    savePreferences: "Guardar Código Postal y Radio",
    savingPreferences: "Guardando...",
    saveList: "Guardar Esta Lista",
    savingList: "Guardando...",
    signedInAs: "Sesión iniciada como",
    notSignedIn: "No has iniciado sesión",
    loginSignup: "Iniciar Sesión / Crear Cuenta",
    savedLists: "Listas Guardadas",
    submitPrice: "Enviar Precio",
    scanReceipt: "Escanear Recibo",
    preferencesSaved: "Código postal y radio guardados correctamente.",
    mustBeLoggedInPreferences: "Debes iniciar sesión para guardar preferencias.",
    mustBeLoggedInList: "Debes iniciar sesión para guardar una lista.",
    enterValidRadius: "Por favor selecciona un radio válido.",
    listSaved: "Lista guardada correctamente.",
    enterAtLeastOneItem: "Por favor ingresa al menos un artículo.",
    quickSavedList: "Lista Guardada Rápida",
    profileLoading: "Cargando perfil...",
  },
};

type Language = "en" | "es";
type OptimizeMode =
  | "lowest-total"
  | "pickup-eligible"
  | "delivery-eligible"
  | "in-store";

type ParsedItem = {
  item: string;
  quantity: number;
};

type Profile = {
  id: string;
  email: string | null;
  zip_code: string | null;
  radius_miles: number | null;
};

type StoreData = {
  name: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  prices: Record<string, number>;
};

type ResultStore = {
  name: string;
  city: string;
  state: string;
  zip: string;
  total: number;
  itemPrices: { item: string; price: number; quantity: number }[];
  deliveryEligible: boolean;
  pickupEligible: boolean;
};

const storeData: StoreData[] = [
  {
    name: "Aldi",
    city: "Elgin",
    state: "IL",
    zip: "60123",
    lat: 42.0354,
    lng: -88.2826,
    prices: {
      milk: 3.29,
      eggs: 2.79,
      bread: 1.89,
      rice: 4.99,
      chicken: 4.49,
      bananas: 0.59,
      cheese: 2.49,
      cereal: 3.19,
      apples: 3.49,
      yogurt: 2.79,
      pasta: 1.59,
      sauce: 2.29,
    },
  },
  {
    name: "Walmart",
    city: "Carpentersville",
    state: "IL",
    zip: "60110",
    lat: 42.1211,
    lng: -88.2579,
    prices: {
      milk: 3.48,
      eggs: 3.05,
      bread: 2.14,
      rice: 5.49,
      chicken: 4.98,
      bananas: 0.64,
      cheese: 2.79,
      cereal: 3.39,
      apples: 3.69,
      yogurt: 2.99,
      pasta: 1.69,
      sauce: 2.39,
    },
  },
  {
    name: "Target",
    city: "South Elgin",
    state: "IL",
    zip: "60177",
    lat: 41.9942,
    lng: -88.2923,
    prices: {
      milk: 3.79,
      eggs: 3.29,
      bread: 2.59,
      rice: 5.99,
      chicken: 5.59,
      bananas: 0.69,
      cheese: 2.99,
      cereal: 3.79,
      apples: 3.99,
      yogurt: 3.19,
      pasta: 1.89,
      sauce: 2.69,
    },
  },
  {
    name: "Jewel Osco",
    city: "Elgin",
    state: "IL",
    zip: "60120",
    lat: 42.0372,
    lng: -88.2837,
    prices: {
      milk: 4.19,
      eggs: 3.89,
      bread: 2.99,
      rice: 6.39,
      chicken: 6.49,
      bananas: 0.79,
      cheese: 3.49,
      cereal: 4.29,
      apples: 4.49,
      yogurt: 3.59,
      pasta: 2.09,
      sauce: 2.99,
    },
  },
  {
    name: "Costco",
    city: "St. Charles",
    state: "IL",
    zip: "60174",
    lat: 41.9139,
    lng: -88.3126,
    prices: {
      milk: 3.1,
      eggs: 2.6,
      bread: 2.2,
      rice: 4.5,
      chicken: 4.25,
      bananas: 0.55,
      cheese: 2.35,
      cereal: 2.99,
      apples: 3.19,
      yogurt: 2.69,
      pasta: 1.49,
      sauce: 2.19,
    },
  },
  {
    name: "Whole Foods",
    city: "Chicago",
    state: "IL",
    zip: "60614",
    lat: 41.9227,
    lng: -87.6533,
    prices: {
      milk: 4.79,
      eggs: 4.19,
      bread: 3.49,
      rice: 6.99,
      chicken: 7.49,
      bananas: 0.89,
      cheese: 4.29,
      cereal: 4.99,
      apples: 4.99,
      yogurt: 4.19,
      pasta: 2.49,
      sauce: 3.29,
    },
  },
];

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function parseGroceryInput(input: string): ParsedItem[] {
  return input
    .toLowerCase()
    .split(",")
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((entry) => {
      const match = entry.match(/^(.+?)\s*x\s*(\d+)$/i);

      if (match) {
        return {
          item: match[1].trim(),
          quantity: Number(match[2]),
        };
      }

      return {
        item: entry,
        quantity: 1,
      };
    });
}

export default function Home() {
  const searchParams = useSearchParams();

  const [language, setLanguage] = useState<Language>("en");
  const [zip, setZip] = useState("");
  const [radius, setRadius] = useState("10");
  const [groceryInput, setGroceryInput] = useState(
    "milk x2, eggs, bread, rice, chicken"
  );
  const [results, setResults] = useState<ResultStore[]>([]);
  const [optimizeMode, setOptimizeMode] =
    useState<OptimizeMode>("lowest-total");

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileMessageType, setProfileMessageType] = useState<
    "success" | "error" | ""
  >("");

  const [savingList, setSavingList] = useState(false);
  const [listMessage, setListMessage] = useState("");
  const [listMessageType, setListMessageType] = useState<
    "success" | "error" | ""
  >("");

  const t = translations[language];

  const parsedItems = useMemo(() => parseGroceryInput(groceryInput), [groceryInput]);

  useEffect(() => {
    const loadUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUserEmail(null);
        setProfileLoaded(true);
        return;
      }

      setUserEmail(user.email ?? null);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, email, zip_code, radius_miles")
        .eq("id", user.id)
        .single<Profile>();

      if (!error && profile) {
        if (profile.zip_code) setZip(profile.zip_code);
        if (profile.radius_miles) setRadius(String(profile.radius_miles));
      }

      setProfileLoaded(true);
    };

    loadUserProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;

      if (!user) {
        setUserEmail(null);
        setProfileLoaded(true);
        return;
      }

      setUserEmail(user.email ?? null);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, email, zip_code, radius_miles")
        .eq("id", user.id)
        .single<Profile>();

      if (!error && profile) {
        if (profile.zip_code) setZip(profile.zip_code);
        if (profile.radius_miles) setRadius(String(profile.radius_miles));
      }

      setProfileLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const listFromUrl = searchParams.get("list");
    if (listFromUrl) {
      setGroceryInput(listFromUrl);
    }
  }, [searchParams]);

  async function handleSaveProfilePreferences() {
    setProfileMessage("");
    setProfileMessageType("");

    const cleanZip = zip.trim();
    const numericRadius = Number(radius);

    if (!userEmail) {
      setProfileMessage(t.mustBeLoggedInPreferences);
      setProfileMessageType("error");
      return;
    }

    if (!cleanZip) {
      setProfileMessage(t.errorZip);
      setProfileMessageType("error");
      return;
    }

    if (Number.isNaN(numericRadius) || numericRadius <= 0) {
      setProfileMessage(t.enterValidRadius);
      setProfileMessageType("error");
      return;
    }

    setSavingProfile(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProfileMessage(t.mustBeLoggedInPreferences);
      setProfileMessageType("error");
      setSavingProfile(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        zip_code: cleanZip,
        radius_miles: numericRadius,
      })
      .eq("id", user.id);

    if (error) {
      setProfileMessage(error.message || "Failed to save preferences.");
      setProfileMessageType("error");
      setSavingProfile(false);
      return;
    }

    setProfileMessage(t.preferencesSaved);
    setProfileMessageType("success");
    setSavingProfile(false);
  }

  async function handleSaveCurrentList() {
    setListMessage("");
    setListMessageType("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setListMessage(t.mustBeLoggedInList);
      setListMessageType("error");
      return;
    }

    const parsed = parseGroceryInput(groceryInput);

    if (parsed.length === 0) {
      setListMessage(t.enterAtLeastOneItem);
      setListMessageType("error");
      return;
    }

    setSavingList(true);

    const { data: newList, error: listError } = await supabase
      .from("grocery_lists")
      .insert({
        user_id: user.id,
        name: t.quickSavedList,
      })
      .select("id")
      .single();

    if (listError || !newList) {
      setListMessage("Failed to create list.");
      setListMessageType("error");
      setSavingList(false);
      return;
    }

    const itemsToInsert = parsed.map((entry) => ({
      grocery_list_id: newList.id,
      item_name: entry.item,
      quantity: entry.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("grocery_list_items")
      .insert(itemsToInsert);

    if (itemsError) {
      setListMessage("Failed to save list items.");
      setListMessageType("error");
      setSavingList(false);
      return;
    }

    setListMessage(t.listSaved);
    setListMessageType("success");
    setSavingList(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUserEmail(null);
  }

  function handleSearch() {
    if (!zip.trim()) {
      alert(t.errorZip);
      return;
    }

    const userLocation = illinoisZipCodes.find((z) => z.zip === zip.trim());

    if (!userLocation) {
      alert(t.invalidZip);
      return;
    }

    const filtered = storeData
      .filter((store) => {
        const distance = getDistance(
          userLocation.lat,
          userLocation.lng,
          store.lat,
          store.lng
        );
        return distance <= Number(radius);
      })
      .map((store) => {
        let total = 0;
        const itemPrices: { item: string; price: number; quantity: number }[] = [];

        parsedItems.forEach((entry) => {
          const unitPrice = store.prices[entry.item];
          if (unitPrice !== undefined) {
            const totalPrice = unitPrice * entry.quantity;
            total += totalPrice;
            itemPrices.push({
              item: entry.item,
              price: totalPrice,
              quantity: entry.quantity,
            });
          }
        });

        return {
          name: store.name,
          city: store.city,
          state: store.state,
          zip: store.zip,
          total,
          itemPrices,
          deliveryEligible: total >= 35,
          pickupEligible: total >= 15,
        };
      })
      .filter((store) => store.itemPrices.length > 0)
      .sort((a, b) => a.total - b.total);

    let sorted = filtered;

    if (optimizeMode === "pickup-eligible") {
      sorted = [...filtered].sort((a, b) => {
        if (a.pickupEligible === b.pickupEligible) return a.total - b.total;
        return a.pickupEligible ? -1 : 1;
      });
    }

    if (optimizeMode === "delivery-eligible") {
      sorted = [...filtered].sort((a, b) => {
        if (a.deliveryEligible === b.deliveryEligible) return a.total - b.total;
        return a.deliveryEligible ? -1 : 1;
      });
    }

    setResults(sorted);
  }

  const totalItemCount = parsedItems.reduce((sum, item) => sum + item.quantity, 0);
  const highestTotal =
    results.length > 0 ? Math.max(...results.map((store) => store.total)) : 0;
  const bestTotal = results.length > 0 ? results[0].total : 0;

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900 flex items-center justify-center p-6">
      <div className="bg-white text-gray-900 p-6 rounded-2xl shadow-md w-full max-w-6xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-slate-900">{t.appName}</h1>

          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="border rounded px-2 py-1 text-black bg-white"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-sm text-slate-600">
            {!profileLoaded
              ? t.profileLoading
              : userEmail
              ? `${t.signedInAs} ${userEmail}`
              : t.notSignedIn}
          </div>

          <div className="flex gap-2 flex-wrap">
            {!userEmail ? (
              <Link
                href="/login"
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
              >
                {t.loginSignup}
              </Link>
            ) : (
              <>
                <Link
                  href="/save-list"
                  className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
                >
                  {t.savedLists}
                </Link>
                <Link
                  href="/submit-price"
                  className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
                >
                  {t.submitPrice}
                </Link>
                <Link
                  href="/receipts"
                  className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
                >
                  {t.scanReceipt}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>

        <label className="block text-sm font-medium mb-1 text-slate-800">
          {t.groceryList}
        </label>
        <textarea
          value={groceryInput}
          onChange={(e) => setGroceryInput(e.target.value)}
          placeholder={t.placeholder}
          className="w-full border rounded-lg px-3 py-2 mb-4 text-black placeholder-gray-400 bg-white"
          rows={3}
        />

        <div className="mb-4 flex gap-3 flex-wrap">
          <button
            onClick={handleSaveCurrentList}
            disabled={savingList}
            className="rounded-lg bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {savingList ? t.savingList : t.saveList}
          </button>
        </div>

        {listMessage && (
          <div
            className={`mb-4 rounded-lg px-3 py-2 text-sm ${
              listMessageType === "success"
                ? "border border-green-200 bg-green-50 text-green-700"
                : "border border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {listMessage}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-800">
              {t.zip}
            </label>
            <input
              type="text"
              placeholder="60123"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4 text-black placeholder-gray-400 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-800">
              {t.radius}
            </label>
            <select
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4 text-black bg-white"
            >
              <option value="5">5 miles</option>
              <option value="10">10 miles</option>
              <option value="20">20 miles</option>
              <option value="50">50 miles</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-800">
              {t.optimizeFor}
            </label>
            <select
              value={optimizeMode}
              onChange={(e) => setOptimizeMode(e.target.value as OptimizeMode)}
              className="w-full border rounded-lg px-3 py-2 mb-4 text-black bg-white"
            >
              <option value="lowest-total">{t.lowestTotal}</option>
              <option value="pickup-eligible">{t.pickupEligible}</option>
              <option value="delivery-eligible">{t.deliveryEligible}</option>
              <option value="in-store">{t.inStore}</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <button
            onClick={handleSaveProfilePreferences}
            disabled={savingProfile || !userEmail}
            className="rounded-lg bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {savingProfile ? t.savingPreferences : t.savePreferences}
          </button>
        </div>

        {profileMessage && (
          <div
            className={`mb-4 rounded-lg px-3 py-2 text-sm ${
              profileMessageType === "success"
                ? "border border-green-200 bg-green-50 text-green-700"
                : "border border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {profileMessage}
          </div>
        )}

        <button
          onClick={handleSearch}
          className="w-full bg-black text-white py-3 rounded-lg"
        >
          {t.search}
        </button>

        {results.length === 0 && zip.trim() && (
          <div className="mt-6 rounded-xl border bg-slate-50 p-4 text-sm text-slate-700">
            {t.noMatch}
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className="mt-6 rounded-xl border bg-slate-50 p-4">
              <h2 className="text-lg font-semibold mb-3 text-slate-900">
                {t.finalCartSummary}
              </h2>

              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg bg-white border p-3">
                  <p className="text-slate-500">{t.totalItems}</p>
                  <p className="font-semibold mt-1 text-slate-900">{totalItemCount}</p>
                </div>

                <div className="rounded-lg bg-white border p-3">
                  <p className="text-slate-500">{t.totalStores}</p>
                  <p className="font-semibold mt-1 text-slate-900">{results.length}</p>
                </div>

                <div className="rounded-lg bg-white border p-3">
                  <p className="text-slate-500">{t.estimatedGrandTotal}</p>
                  <p className="font-semibold mt-1 text-slate-900">
                    ${bestTotal.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-3 text-sm font-medium text-green-700">
                {t.savingsVsSingle}: ${(highestTotal - bestTotal).toFixed(2)}
              </div>
            </div>

            <div className="mt-6">
              <div className="rounded-xl border bg-indigo-50 p-4 mb-4">
                <p className="text-sm font-semibold text-indigo-700">
                  {t.smartSplit}
                </p>
                <p className="text-sm text-slate-700 mt-1">
                  {t.smartSplitDesc}
                </p>
                <div className="mt-3 rounded-lg bg-white border p-3 text-sm">
                  <p className="text-slate-500">{t.cheapestSingleStore}</p>
                  <p className="font-semibold mt-1 text-slate-900">
                    {results[0].name} • {results[0].city}, {results[0].state}{" "}
                    {results[0].zip} • ${results[0].total.toFixed(2)}
                  </p>
                </div>
              </div>

              <h2 className="font-semibold text-lg mb-3 text-slate-900">
                {t.nearby}
              </h2>

              <div className="space-y-4">
                {results.map((store, index) => (
                  <div key={index} className="border rounded-xl p-4 bg-gray-50">
                    <div>
                      <p className="font-semibold text-lg text-slate-900">{store.name}</p>
                      <p className="text-sm text-gray-600">
                        {store.city}, {store.state} {store.zip}
                      </p>
                      <p className="text-sm text-green-600 font-semibold mt-1">
                        ${store.total.toFixed(2)} total
                      </p>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2 text-slate-800">
                        {t.itemBreakdown}
                      </p>
                      <div className="space-y-2">
                        {store.itemPrices.map((itemPrice) => (
                          <div
                            key={`${store.name}-${itemPrice.item}`}
                            className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border"
                          >
                            <div>
                              <span className="capitalize text-sm text-slate-900">
                                {itemPrice.item}
                              </span>
                              <span className="text-xs text-slate-500 ml-2">
                                {t.quantity}: {itemPrice.quantity}
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-slate-900">
                              ${itemPrice.price.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 grid md:grid-cols-2 gap-3">
                      <div
                        className={`rounded-lg px-3 py-3 text-sm border ${
                          store.deliveryEligible
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-rose-50 border-rose-200 text-rose-700"
                        }`}
                      >
                        <p className="font-semibold">{t.delivery}</p>
                        <p className="mt-1">
                          {store.deliveryEligible
                            ? t.eligibleDelivery
                            : `${t.unlockDelivery}: $${(35 - store.total).toFixed(2)}`}
                        </p>
                        <p className="mt-1 text-xs">{t.minDelivery}</p>
                      </div>

                      <div
                        className={`rounded-lg px-3 py-3 text-sm border ${
                          store.pickupEligible
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-rose-50 border-rose-200 text-rose-700"
                        }`}
                      >
                        <p className="font-semibold">{t.pickup}</p>
                        <p className="mt-1">
                          {store.pickupEligible
                            ? t.eligiblePickup
                            : `${t.unlockPickup}: $${(15 - store.total).toFixed(2)}`}
                        </p>
                        <p className="mt-1 text-xs">{t.minPickup}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}