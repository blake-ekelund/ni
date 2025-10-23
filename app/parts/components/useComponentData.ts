import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ComponentRecord } from "./types";

// ---------- Types ----------

export interface ProductRecord {
  part: string; // SKU code
  product: string;
  type: string;
  fragrance: string;
  size: string;
}

// ---------- Hook ----------

export function useComponentData() {
  const [components, setComponents] = useState<ComponentRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    product: "All",
    type: "All",
    fragrance: "All",
    size: "All",
  });

  // 1️⃣ Fetch components + products on load
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [{ data: compData, error: compError }, { data: prodData, error: prodError }] =
          await Promise.all([
            supabase.from("component_usage_view").select("*"),
            supabase.from("product_filter_view").select("part, product, type, fragrance, size"),
          ]);

        if (compError) console.error("❌ Supabase component fetch error:", compError);
        if (prodError) console.error("❌ Supabase product fetch error:", prodError);

        setComponents((compData as ComponentRecord[]) ?? []);
        setProducts((prodData as ProductRecord[]) ?? []);

        console.log("✅ Loaded components:", compData?.length || 0);
        console.log("✅ Loaded products:", prodData?.length || 0);
      } catch (err) {
        console.error("❌ Unexpected fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // 2️⃣ Build list of SKUs (part codes) that match active filters
  const filteredProductCodes = useMemo(() => {
    if (products.length === 0) return [];

    const matching = products
      .filter((p) => {
        const matchProduct =
          filters.product === "All" ||
          (p.product || "").toLowerCase() === (filters.product || "").toLowerCase();
        const matchType =
          filters.type === "All" ||
          (p.type || "").toLowerCase() === (filters.type || "").toLowerCase();
        const matchFragrance =
          filters.fragrance === "All" ||
          (p.fragrance || "").toLowerCase() === (filters.fragrance || "").toLowerCase();
        const matchSize =
          filters.size === "All" ||
          (p.size || "").toLowerCase() === (filters.size || "").toLowerCase();

        return matchProduct && matchType && matchFragrance && matchSize;
      })
      .map((p) => p.part || p.product);

    return matching;
  }, [products, filters]);

  // 3️⃣ Filter components to show only those used in filtered SKUs
  const filteredComponents = useMemo(() => {
    if (components.length === 0) return [];

    const noFilters = Object.values(filters).every((v) => v === "All");
    if (noFilters) return components;

    return components.filter((c) => {
      const used = Array.isArray(c.used_in) ? c.used_in : [];
      return used.some((sku) =>
        filteredProductCodes.some(
          (code) => (code || "").toLowerCase().trim() === (sku || "").toLowerCase().trim()
        )
      );
    });
  }, [components, filteredProductCodes, filters]);

  // 4️⃣ Helper: filter used_in list for active filters
  const getUsedInFiltered = (used_in: string[]): string[] => {
    if (!Array.isArray(used_in)) return [];
    const noFilters = Object.values(filters).every((v) => v === "All");
    if (noFilters) return used_in;

    return used_in.filter((sku) =>
      filteredProductCodes.some(
        (code) => (code || "").toLowerCase().trim() === (sku || "").toLowerCase().trim()
      )
    );
  };

  // 5️⃣ Refresh components from Supabase
  const refresh = async () => {
    const { data, error } = await supabase.from("component_usage_view").select("*");
    if (error) console.error("❌ Supabase refresh error:", error);
    setComponents((data as ComponentRecord[]) ?? []);
  };

  return {
    loading,
    filters,
    setFilters,
    products,
    components: filteredComponents,
    getUsedInFiltered,
    setComponents,
    refresh,
  };
}
