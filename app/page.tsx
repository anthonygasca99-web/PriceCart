"use client";

import { useMemo, useState } from "react";
import { zipLocations } from "../data/zipcodes";

const translations = {
  en: {
    appName: "PriceCart",
    zip: "ZIP Code",
    radius: "Radius",
    search: "Find Stores",
    nearby: "Store Comparison",
    errorZip: "Please enter a ZIP code",
    invalidZip: "ZIP code not found in our starter database yet",
    groceryList: "Grocery List",
    placeholder: "milk x2, eggs, bread, rice, chicken",
    delivery: "Delivery",
    pickup: "Pickup",
    minDelivery: "Minimum $35 for delivery",
    minPickup: "Minimum $15 for pickup",
    itemBreakdown: "Item breakdown",
    selectStore: "Select this store",
    selected: "Selected",
    eligibleDelivery: "Eligible for delivery",
    eligiblePickup: "Eligible for pickup",
    smartSplit: "Smart Split Cart",
    smartSplitDesc:
      "PriceCart can split your cart across stores to lower your total and show what qualifies for pickup or delivery.",
    cheapestSingleStore: "Cheapest single store",
    smartCartPlan: "AI-style split recommendation",
    savingsVsSingle: "Savings vs cheapest single store",
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
    totalStores: "Stores used",
    estimatedGrandTotal: "Estimated grand total",
    storeFeesNote:
      "Delivery is coordinated through eligible stores. Store delivery fees may apply. Tips are optional.",
    chooseStorePerItem: "Choose store per item",
    chooseStoreDesc:
      "You can keep the smart recommendation or manually choose a store for each item.",
    bestPrice: "Best price",
    selectedStoreForItem: "Selected store",
    suggestedItems: "Suggested items to unlock delivery",
    addToList: "Add to list",
    deliveryGap: "Delivery gap",
  },
  es: {
    appName: "PriceCart",
    zip: "Código Postal",
    radius: "Radio",
    search: "Buscar Tiendas",
    nearby: "Comparación de Tiendas",
    errorZip: "Por favor ingresa un código postal",
    invalidZip: "Ese código postal todavía no está en nuestra base de datos inicial",
    groceryList: "Lista de Compras",
    placeholder: "leche x2, huevos, pan, arroz, pollo",
    delivery: "Entrega",
    pickup: "Recogida",
    minDelivery: "Mínimo $35 para entrega",
    minPickup: "Mínimo $15 para recogida",
    itemBreakdown: "Desglose de artículos",
    selectStore: "Seleccionar esta tienda",
    selected: "Seleccionado",
    eligibleDelivery: "Califica para entrega",
    eligiblePickup: "Califica para recogida",
    smartSplit: "Carrito Inteligente",
    smartSplitDesc:
      "PriceCart puede dividir tu carrito entre tiendas para bajar tu total y mostrar qué califica para recogida o entrega.",
    cheapestSingleStore: "Tienda única más barata",
    smartCartPlan: "Recomendación inteligente",
    savingsVsSingle: "Ahorro vs la tienda única más barata",
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
    totalStores: "Tiendas usadas",
    estimatedGrandTotal: "Total estimado",
    storeFeesNote:
      "La entrega se coordina a través de tiendas elegibles. Pueden aplicarse tarifas de entrega. La propina es opcional.",
    chooseStorePerItem: "Elegir tienda por artículo",
    chooseStoreDesc:
      "Puedes mantener la recomendación inteligente o elegir manualmente una tienda para cada artículo.",
    bestPrice: "Mejor precio",
    selectedStoreForItem: "Tienda seleccionada",
    suggestedItems: "Artículos sugeridos para desbloquear entrega",
    addToList: "Agregar a la lista",
    deliveryGap: "Falta para entrega",
  },
};

type Language = "en" | "es";
type OptimizeMode =
  | "lowest-total"
  | "pickup-eligible"
  | "delivery-eligible"
  | "in-store";

type StoreData = {
  name: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  prices: Record<string, number>;
};

type ParsedItem = {
  item: string;
  quantity: number;
};

type ResultStore = {
  name: string;
  city: string;
  state: string;
  zip: string;
  total: number;
  matchedItems: string[];
  itemPrices: { item: string; price: number; quantity: number }[];
  deliveryEligible: boolean;
  pickupEligible: boolean;
};

type SmartAssignment = {
  item: string;
  storeName: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  quantity: number;
};

type SmartStoreSummary = {
  storeName: string;
  city: string;
  state: string;
  zip: string;
  subtotal: number;
  items: { item: string; price: number; quantity: number }[];
  pickupEligible: boolean;
  deliveryEligible: boolean;
};

type ItemChoice = {
  item: string;
  quantity: number;
  options: {
    storeName: string;
    city: string;
    state: string;
    zip: string;
    totalPrice: number;
    unitPrice: number;
  }[];
  suggestedStore?: string;
  selectedStore?: string;
};

type SuggestionItem = {
  item: string;
  price: number;
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
      beans: 2.49,
      tortillas: 2.19,
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
      beans: 2.78,
      tortillas: 2.38,
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
      beans: 2.99,
      tortillas: 2.69,
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
      beans: 3.39,
      tortillas: 3.09,
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
      beans: 2.3,
      tortillas: 2.1,
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
      beans: 3.79,
      tortillas: 3.49,
      apples: 4.99,
      yogurt: 4.19,
      pasta: 2.49,
      sauce: 3.29,
    },
  },
  {
    name: "Tony's Fresh Market",
    city: "Chicago",
    state: "IL",
    zip: "60639",
    lat: 41.92,
    lng: -87.7553,
    prices: {
      milk: 3.99,
      eggs: 3.49,
      bread: 2.79,
      rice: 5.89,
      chicken: 5.99,
      bananas: 0.72,
      cheese: 3.19,
      cereal: 3.99,
      beans: 2.99,
      tortillas: 2.79,
      apples: 4.19,
      yogurt: 3.29,
      pasta: 1.99,
      sauce: 2.79,
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

function getNeededAmount(current: number, minimum: number) {
  return current >= minimum ? 0 : minimum - current;
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

function stringifyItems(items: ParsedItem[]) {
  return items
    .map((entry) => (entry.quantity > 1 ? `${entry.item} x${entry.quantity}` : entry.item))
    .join(", ");
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [zip, setZip] = useState("");
  const [radius, setRadius] = useState("10");
  const [groceryInput, setGroceryInput] = useState(
    "milk x2, eggs, bread, rice, chicken"
  );
  const [results, setResults] = useState<ResultStore[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [optimizeMode, setOptimizeMode] =
    useState<OptimizeMode>("lowest-total");
  const [visibleStores, setVisibleStores] = useState<StoreData[]>([]);
  const [normalizedItems, setNormalizedItems] = useState<ParsedItem[]>([]);
  const [manualSelections, setManualSelections] = useState<Record<string, string>>(
    {}
  );

  const t = translations[language];

  const smartAssignments = useMemo<SmartAssignment[]>(() => {
    if (visibleStores.length === 0 || normalizedItems.length === 0) return [];

    const assignFromStores = (sourceStores: StoreData[]) =>
      normalizedItems
        .map((entry) => {
          const manuallySelectedStoreName = manualSelections[entry.item];
          if (manuallySelectedStoreName) {
            const manualStore = sourceStores.find(
              (store) => store.name === manuallySelectedStoreName
            );
            const manualPrice = manualStore?.prices[entry.item];
            if (manualStore && manualPrice !== undefined) {
              return {
                item: entry.item,
                storeName: manualStore.name,
                city: manualStore.city,
                state: manualStore.state,
                zip: manualStore.zip,
                price: manualPrice * entry.quantity,
                quantity: entry.quantity,
              };
            }
          }

          const options = sourceStores
            .map((store) => {
              const unitPrice = store.prices[entry.item];
              return unitPrice !== undefined
                ? {
                    item: entry.item,
                    storeName: store.name,
                    city: store.city,
                    state: store.state,
                    zip: store.zip,
                    price: unitPrice * entry.quantity,
                    quantity: entry.quantity,
                  }
                : null;
            })
            .filter(Boolean) as SmartAssignment[];

          if (options.length === 0) return null;
          return options.sort((a, b) => a.price - b.price)[0];
        })
        .filter(Boolean) as SmartAssignment[];

    if (optimizeMode === "lowest-total") {
      return assignFromStores(visibleStores);
    }

    if (optimizeMode === "pickup-eligible") {
      const pickupCandidates = visibleStores.filter((store) => {
        const subtotal = normalizedItems.reduce(
          (sum, entry) => sum + (store.prices[entry.item] || 0) * entry.quantity,
          0
        );
        return subtotal >= 15;
      });

      return assignFromStores(
        pickupCandidates.length > 0 ? pickupCandidates : visibleStores
      );
    }

    if (optimizeMode === "delivery-eligible") {
      const deliveryCandidates = visibleStores.filter((store) => {
        const subtotal = normalizedItems.reduce(
          (sum, entry) => sum + (store.prices[entry.item] || 0) * entry.quantity,
          0
        );
        return subtotal >= 35;
      });

      return assignFromStores(
        deliveryCandidates.length > 0 ? deliveryCandidates : visibleStores
      );
    }

    return assignFromStores(visibleStores);
  }, [visibleStores, normalizedItems, optimizeMode, manualSelections]);

  const smartSummary = useMemo(() => {
    const grouped = new Map<string, SmartStoreSummary>();

    smartAssignments.forEach((assignment) => {
      const key = `${assignment.storeName}-${assignment.city}`;
      const existing = grouped.get(key);

      if (existing) {
        existing.subtotal += assignment.price;
        existing.items.push({
          item: assignment.item,
          price: assignment.price,
          quantity: assignment.quantity,
        });
      } else {
        grouped.set(key, {
          storeName: assignment.storeName,
          city: assignment.city,
          state: assignment.state,
          zip: assignment.zip,
          subtotal: assignment.price,
          items: [
            {
              item: assignment.item,
              price: assignment.price,
              quantity: assignment.quantity,
            },
          ],
          pickupEligible: false,
          deliveryEligible: false,
        });
      }
    });

    return Array.from(grouped.values()).map((group) => ({
      ...group,
      pickupEligible: group.subtotal >= 15,
      deliveryEligible: group.subtotal >= 35,
    }));
  }, [smartAssignments]);

  const smartTotal = useMemo(() => {
    return smartAssignments.reduce((sum, item) => sum + item.price, 0);
  }, [smartAssignments]);

  const totalItemCount = useMemo(() => {
    return normalizedItems.reduce((sum, entry) => sum + entry.quantity, 0);
  }, [normalizedItems]);

  const cheapestSingleStore = useMemo(() => {
    return results.length > 0 ? results[0] : null;
  }, [results]);

  const itemChoices = useMemo<ItemChoice[]>(() => {
    if (visibleStores.length === 0 || normalizedItems.length === 0) return [];

    return normalizedItems.map((entry) => {
      const options = visibleStores
        .map((store) => {
          const unitPrice = store.prices[entry.item];
          return unitPrice !== undefined
            ? {
                storeName: store.name,
                city: store.city,
                state: store.state,
                zip: store.zip,
                totalPrice: unitPrice * entry.quantity,
                unitPrice,
              }
            : null;
        })
        .filter(Boolean) as ItemChoice["options"];

      const sortedOptions = [...options].sort((a, b) => a.totalPrice - b.totalPrice);
      const bestOption = sortedOptions[0];

      return {
        item: entry.item,
        quantity: entry.quantity,
        options: sortedOptions,
        suggestedStore: bestOption?.storeName,
        selectedStore: manualSelections[entry.item] || bestOption?.storeName,
      };
    });
  }, [visibleStores, normalizedItems, manualSelections]);

  const deliverySuggestions = useMemo<Record<string, SuggestionItem[]>>(() => {
    const suggestions: Record<string, SuggestionItem[]> = {};

    smartSummary.forEach((group) => {
      if (group.deliveryEligible) return;

      const store = visibleStores.find((s) => s.name === group.storeName);
      if (!store) return;

      const currentItems = new Set(group.items.map((item) => item.item));
      const gap = getNeededAmount(group.subtotal, 35);

      const candidates = Object.entries(store.prices)
        .filter(([item]) => !currentItems.has(item))
        .map(([item, price]) => ({ item, price }))
        .sort((a, b) => a.price - b.price);

      const chosen: SuggestionItem[] = [];
      let running = 0;

      for (const candidate of candidates) {
        if (running >= gap) break;
        chosen.push(candidate);
        running += candidate.price;
      }

      suggestions[group.storeName] = chosen;
    });

    return suggestions;
  }, [smartSummary, visibleStores]);

  const handleSearch = () => {
    if (!zip.trim()) {
      alert(t.errorZip);
      return;
    }

    const userLocation = zipLocations.find((z) => z.zip === zip.trim());

    if (!userLocation) {
      alert(t.invalidZip);
      return;
    }

    const groceryItems = parseGroceryInput(groceryInput);

    const filteredStores = storeData.filter((store) => {
      const distance = getDistance(
        userLocation.lat,
        userLocation.lng,
        store.lat,
        store.lng
      );
      return distance <= Number(radius);
    });

    const filtered = filteredStores
      .map((store) => {
        let total = 0;
        const matchedItems: string[] = [];
        const itemPrices: { item: string; price: number; quantity: number }[] = [];

        groceryItems.forEach((entry) => {
          const unitPrice = store.prices[entry.item];
          if (unitPrice !== undefined) {
            const totalPrice = unitPrice * entry.quantity;
            total += totalPrice;
            matchedItems.push(entry.item);
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
          matchedItems,
          itemPrices,
          deliveryEligible: total >= 35,
          pickupEligible: total >= 15,
        };
      })
      .filter((store) => store.matchedItems.length > 0)
      .sort((a, b) => a.total - b.total);

    setVisibleStores(filteredStores);
    setNormalizedItems(groceryItems);
    setResults(filtered);
    setSelectedStore(null);
    setManualSelections({});
  };

  const handleStoreSelectionChange = (item: string, storeName: string) => {
    setManualSelections((prev) => ({
      ...prev,
      [item]: storeName,
    }));
  };

  const addSuggestedItems = (storeName: string) => {
    const suggested = deliverySuggestions[storeName];
    if (!suggested || suggested.length === 0) return;

    const current = parseGroceryInput(groceryInput);
    const updated = [...current];

    suggested.forEach((suggestion) => {
      const existing = updated.find((entry) => entry.item === suggestion.item);
      if (existing) {
        existing.quantity += 1;
      } else {
        updated.push({ item: suggestion.item, quantity: 1 });
      }
    });

    setGroceryInput(stringifyItems(updated));
  };

  return (
    <main className="min-h-screen bg-gray-100 text-black flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-6xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-slate-900">{t.appName}</h1>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="border rounded px-2 py-1 text-black bg-white"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
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

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-800">
              {t.zip}
            </label>
            <input
              type="text"
              placeholder="Enter any supported U.S. ZIP"
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

        <button
          onClick={handleSearch}
          className="w-full bg-black text-white py-3 rounded-lg"
        >
          {t.search}
        </button>

        {results.length === 0 && normalizedItems.length > 0 && (
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
                  <p className="font-semibold mt-1 text-slate-900">{smartSummary.length}</p>
                </div>

                <div className="rounded-lg bg-white border p-3">
                  <p className="text-slate-500">{t.estimatedGrandTotal}</p>
                  <p className="font-semibold mt-1 text-slate-900">${smartTotal.toFixed(2)}</p>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">{t.storeFeesNote}</p>
            </div>

            <div className="mt-6 grid xl:grid-cols-3 gap-6">
              <div>
                <div className="rounded-xl border bg-indigo-50 p-4 mb-4">
                  <p className="text-sm font-semibold text-indigo-700">
                    {t.smartSplit}
                  </p>
                  <p className="text-sm text-slate-700 mt-1">
                    {t.smartSplitDesc}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-white border p-3">
                      <p className="text-slate-500">{t.cheapestSingleStore}</p>
                      <p className="font-semibold mt-1 text-slate-900">
                        {cheapestSingleStore
                          ? `${cheapestSingleStore.name} • $${cheapestSingleStore.total.toFixed(2)}`
                          : "—"}
                      </p>
                    </div>

                    <div className="rounded-lg bg-white border p-3">
                      <p className="text-slate-500">{t.smartCartPlan}</p>
                      <p className="font-semibold mt-1 text-slate-900">
                        ${smartTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-sm font-medium text-green-700">
                    {t.savingsVsSingle}: $
                    {Math.max(
                      0,
                      (cheapestSingleStore?.total || 0) - smartTotal
                    ).toFixed(2)}
                  </p>
                </div>

                <h2 className="font-semibold text-lg mb-3 text-slate-900">
                  {t.smartCartPlan}
                </h2>
                <div className="space-y-4">
                  {smartSummary.map((group) => (
                    <div
                      key={`${group.storeName}-${group.city}`}
                      className="border rounded-xl p-4 bg-slate-50"
                    >
                      <div>
                        <p className="font-semibold text-lg text-slate-900">
                          {group.storeName}
                        </p>
                        <p className="text-sm text-slate-600">
                          {group.city}, {group.state} {group.zip}
                        </p>
                        <p className="text-sm text-green-600 font-semibold mt-1">
                          {t.subtotal}: ${group.subtotal.toFixed(2)}
                        </p>
                      </div>

                      <div className="mt-4 space-y-2">
                        {group.items.map((itemPrice) => (
                          <div
                            key={`${group.storeName}-${itemPrice.item}`}
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

                      <div className="mt-4 grid gap-3">
                        <div
                          className={`rounded-lg px-3 py-3 text-sm border ${
                            group.deliveryEligible
                              ? "bg-green-50 border-green-200 text-green-700"
                              : "bg-amber-50 border-amber-200 text-amber-700"
                          }`}
                        >
                          <p className="font-semibold">{t.delivery}</p>
                          <p className="mt-1">
                            {group.deliveryEligible
                              ? t.eligibleDelivery
                              : `${t.deliveryGap}: $${getNeededAmount(
                                  group.subtotal,
                                  35
                                ).toFixed(2)}`}
                          </p>
                          <p className="mt-1 text-xs">{t.minDelivery}</p>

                          {!group.deliveryEligible && (
                            <div className="mt-3">
                              <p className="text-xs font-medium mb-2">
                                {t.suggestedItems}
                              </p>

                              {deliverySuggestions[group.storeName] &&
                              deliverySuggestions[group.storeName].length > 0 ? (
                                <>
                                  <div className="space-y-2">
                                    {deliverySuggestions[group.storeName].map(
                                      (suggestion) => (
                                        <div
                                          key={`${group.storeName}-${suggestion.item}`}
                                          className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border"
                                        >
                                          <span className="capitalize text-sm">
                                            {suggestion.item}
                                          </span>
                                          <span className="text-sm font-semibold">
                                            ${suggestion.price.toFixed(2)}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                  <button
                                    onClick={() => addSuggestedItems(group.storeName)}
                                    className="mt-3 rounded-lg bg-black text-white px-3 py-2 text-sm"
                                  >
                                    {t.addToList}
                                  </button>
                                </>
                              ) : null}
                            </div>
                          )}
                        </div>

                        <div
                          className={`rounded-lg px-3 py-3 text-sm border ${
                            group.pickupEligible
                              ? "bg-green-50 border-green-200 text-green-700"
                              : "bg-amber-50 border-amber-200 text-amber-700"
                          }`}
                        >
                          <p className="font-semibold">{t.pickup}</p>
                          <p className="mt-1">
                            {group.pickupEligible
                              ? t.eligiblePickup
                              : `${t.unlockPickup}: $${getNeededAmount(
                                  group.subtotal,
                                  15
                                ).toFixed(2)}`}
                          </p>
                          <p className="mt-1 text-xs">{t.minPickup}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-semibold text-lg mb-3 text-slate-900">
                  {t.chooseStorePerItem}
                </h2>
                <p className="text-sm text-slate-600 mb-4">
                  {t.chooseStoreDesc}
                </p>

                <div className="space-y-4">
                  {itemChoices.map((choice) => (
                    <div key={choice.item} className="border rounded-xl p-4 bg-slate-50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold capitalize text-slate-900">{choice.item}</p>
                          <p className="text-sm text-slate-600">
                            {t.quantity}: {choice.quantity}
                          </p>
                        </div>
                        {choice.options[0] && (
                          <p className="text-sm text-green-700 font-medium">
                            {t.bestPrice}: ${choice.options[0].totalPrice.toFixed(2)}
                          </p>
                        )}
                      </div>

                      <label className="block text-sm font-medium mb-2 text-slate-800">
                        {t.selectedStoreForItem}
                      </label>
                      <select
                        value={choice.selectedStore}
                        onChange={(e) =>
                          handleStoreSelectionChange(choice.item, e.target.value)
                        }
                        className="w-full border rounded-lg px-3 py-2 text-black bg-white"
                      >
                        {choice.options.map((option) => (
                          <option key={`${choice.item}-${option.storeName}`} value={option.storeName}>
                            {option.storeName} • {option.city}, {option.state} {option.zip} • ${option.totalPrice.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-semibold text-lg mb-3 text-slate-900">
                  {t.nearby}
                </h2>
                <div className="space-y-4">
                  {results.map((store, index) => (
                    <div
                      key={index}
                      className={`border rounded-xl p-4 bg-gray-50 ${
                        selectedStore === store.name
                          ? "border-black ring-2 ring-black/10"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-lg text-slate-900">{store.name}</p>
                          <p className="text-sm text-gray-600">
                            {store.city}, {store.state} {store.zip}
                          </p>
                          <p className="text-sm text-green-600 font-semibold mt-1">
                            ${store.total.toFixed(2)} total
                          </p>
                        </div>

                        <button
                          onClick={() => setSelectedStore(store.name)}
                          className={`rounded-lg px-3 py-2 text-sm font-medium ${
                            selectedStore === store.name
                              ? "bg-green-600 text-white"
                              : "bg-black text-white"
                          }`}
                        >
                          {selectedStore === store.name
                            ? t.selected
                            : t.selectStore}
                        </button>
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
                              : `${t.unlockDelivery}: $${getNeededAmount(
                                  store.total,
                                  35
                                ).toFixed(2)}`}
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
                              : `${t.unlockPickup}: $${getNeededAmount(
                                  store.total,
                                  15
                                ).toFixed(2)}`}
                          </p>
                          <p className="mt-1 text-xs">{t.minPickup}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}