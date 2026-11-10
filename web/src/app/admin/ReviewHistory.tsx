"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type HistoryItem = {
  id: string;
  currency_id: string;
  rate_cup: number;
  market_side: string;
  status: string;
  observed_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  review_notes: string | null;
};

type Currency = {
  id: string;
  code: string;
  name: string;
};

export default function ReviewHistory() {
  const supabase = createClient();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    const [history, currencyList] = await Promise.all([
      supabase
        .from("observations")
        .select("id, currency_id, rate_cup, market_side, status, observed_at, reviewed_at, rejection_reason, review_notes")
        .in("status", ["verified", "rejected"])
        .order("reviewed_at", { ascending: false })
        .limit(100),
      supabase
        .from("currencies")
        .select("id, code, name"),
    ]);

    if (history.error) {
      setError(history.error.message);
      setItems([]);
    } else {
      setItems(history.data ?? []);
    }

    if (currencyList.error) {
      setError((current) =>
        current
          ? `${current} | ${currencyList.error.message}`
          : currencyList.error.message
      );
    } else {
      setCurrencies(currencyList.data ?? []);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  return (
    <section className="mt-8 rounded-2xl border border-gray-700 bg-[#11151c] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold tracking-[0.2em] text-yellow-500">
            REGISTRO DE ACTIVIDAD
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Historial de revisiones
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Últimas 100 observaciones verificadas o rechazadas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadHistory()}
          disabled={loading}
          className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-50"
        >
          Actualizar
        </button>
      </div>

      {error && (
        <p className="mt-5 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-gray-400">Cargando historial...</p>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-700 p-6 text-center">
          <p className="font-semibold text-white">
            Todavía no hay revisiones registradas.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Las decisiones de aprobación y rechazo aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((item) => {
            const currency = currencies.find(
              (entry) => entry.id === item.currency_id
            );

            return (
              <article
                key={item.id}
                className="rounded-xl border border-gray-700 bg-[#090d13] p-4"
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">
                      {currency?.code ?? "Moneda"} ·{" "}
                      <span className="text-yellow-400">
                        {Number(item.rate_cup).toLocaleString("es-CU")} CUP
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      {item.market_side === "buy"
                        ? "Compra"
                        : item.market_side === "sell"
                          ? "Venta"
                          : "Referencia"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      item.status === "verified"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {item.status === "verified" ? "Verificada" : "Rechazada"}
                  </span>
                </div>

                <p className="mt-3 text-xs text-gray-400">
                  Observada: {new Date(item.observed_at).toLocaleString("es-CU")}
                </p>

                {item.reviewed_at && (
                  <p className="mt-1 text-xs text-gray-400">
                    Revisada: {new Date(item.reviewed_at).toLocaleString("es-CU")}
                  </p>
                )}

                {item.rejection_reason && (
                  <p className="mt-3 text-sm text-red-300">
                    Motivo: {item.rejection_reason}
                  </p>
                )}

                {item.review_notes && (
                  <p className="mt-2 text-sm text-gray-400">
                    Notas: {item.review_notes}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
