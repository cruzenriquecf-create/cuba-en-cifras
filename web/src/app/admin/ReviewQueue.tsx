"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Observation = {
  id: string;
  currency_id: string;
  rate_cup: number;
  market_side: string;
  observed_at: string;
  created_at: string;
  notes: string | null;
};

type Currency = {
  id: string;
  code: string;
  name: string;
  symbol: string;
};

export default function ReviewQueue() {
  // Keep one browser client for the lifetime of this component.
  // A new client on every render changes loadPending and retriggers the effect.
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<Observation[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadPending = useCallback(async () => {
    setLoading(true);
    setError("");

    const [observationsResult, currenciesResult] = await Promise.all([
      supabase
        .from("observations")
        .select("id, currency_id, rate_cup, market_side, observed_at, created_at, notes")
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
      supabase
        .from("currencies")
        .select("id, code, name, symbol")
        .eq("is_active", true),
    ]);

    if (observationsResult.error) {
      setError(observationsResult.error.message);
      setItems([]);
    } else {
      setItems(observationsResult.data ?? []);
    }

    if (currenciesResult.error) {
      setError((current) =>
        current
          ? `${current} | ${currenciesResult.error.message}`
          : currenciesResult.error.message
      );
    } else {
      setCurrencies(currenciesResult.data ?? []);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadPending();
  }, [loadPending]);

  async function review(item: Observation, status: "verified" | "rejected") {
    let reason: string | null = null;

    if (status === "rejected") {
      const answer = window.prompt("Escribe el motivo del rechazo:");
      if (answer === null) return;
      reason = answer.trim();

      if (!reason) {
        setError("Debes escribir un motivo para rechazar la observación.");
        return;
      }
    } else if (!window.confirm("¿Confirmas que esta tasa ha sido revisada y es correcta?")) {
      return;
    }

    setBusyId(item.id);
    setError("");
    setMessage("");

    const { error: reviewError } = await supabase.rpc("review_observation", {
      p_observation_id: item.id,
      p_status: status,
      p_review_notes: null,
      p_rejection_reason: reason,
    });

    if (reviewError) {
      setError(reviewError.message);
    } else {
      setMessage(
        status === "verified"
          ? "Observación verificada correctamente."
          : "Observación rechazada correctamente."
      );
      await loadPending();
    }

    setBusyId(null);
  }

  function currencyFor(id: string) {
    return currencies.find((currency) => currency.id === id);
  }

  return (
    <section className="mt-8 rounded-2xl border border-yellow-500/20 bg-[#11151c] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold tracking-[0.2em] text-yellow-500">
            CONTROL EDITORIAL
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Revisar observaciones
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Solo las observaciones aprobadas podrán publicarse.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadPending()}
          disabled={loading}
          className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
        >
          {loading ? "Actualizando..." : "Actualizar lista"}
        </button>
      </div>

      {message && (
        <p className="mt-5 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-gray-400">Cargando observaciones...</p>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-700 p-6 text-center">
          <p className="font-semibold text-white">
            No hay observaciones pendientes.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Las nuevas tasas registradas aparecerán aquí para su revisión.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => {
            const currency = currencyFor(item.currency_id);

            return (
              <article
                key={item.id}
                className="rounded-xl border border-gray-700 bg-[#090d13] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-white">
                      {currency?.code ?? "Moneda"}{" "}
                      <span className="text-yellow-400">
                        {Number(item.rate_cup).toLocaleString("es-CU")} CUP
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      {currency?.name ?? "Moneda no identificada"}
                      {currency?.symbol ? ` (${currency.symbol})` : ""}
                    </p>
                  </div>

                  <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                    Pendiente
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-gray-300 sm:grid-cols-2">
                  <p>
                    <span className="text-gray-500">Operación:</span>{" "}
                    {item.market_side === "buy"
                      ? "Compra"
                      : item.market_side === "sell"
                        ? "Venta"
                        : "Referencia"}
                  </p>
                  <p>
                    <span className="text-gray-500">Observada:</span>{" "}
                    {new Date(item.observed_at).toLocaleString("es-CU")}
                  </p>
                </div>

                {item.notes && (
                  <p className="mt-3 text-sm text-gray-400">
                    <span className="text-gray-500">Notas:</span> {item.notes}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void review(item, "verified")}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-500 disabled:opacity-50"
                  >
                    {busyId === item.id ? "Procesando..." : "Verificar"}
                  </button>

                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void review(item, "rejected")}
                    className="rounded-lg border border-red-500/60 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
