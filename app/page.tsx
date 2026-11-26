"use client";
import { useState } from "react";
import { fifo, type Resultado } from "../lib/fifo";
import { lfu } from "../lib/lfu";

type Algoritmo = "FIFO" | "LFU";

const DESCRIPCION: Record<Algoritmo, string> = {
  FIFO: "Sale la página que lleva más tiempo en memoria (la primera en entrar).",
  LFU: "Sale la página con el contador más bajo. En caso de empate, sale la más antigua. Formato: página(contador).",
};

export default function Home() {
  // Lo que el usuario escribe
  const [algoritmo, setAlgoritmo] = useState<Algoritmo>("FIFO");
  const [numMarcos, setNumMarcos] = useState(3);
  const [refsTexto, setRefsTexto] = useState("4,2,3,1,4,5,6,2,1,7");

  // Lo que se calculó al pulsar "Calcular"
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [usado, setUsado] = useState<{ alg: Algoritmo; marcos: number }>({
    alg: "FIFO",
    marcos: 3,
  });
  const [error, setError] = useState("");

  function calcular() {
    const refs = refsTexto.split(/[,\s]+/).filter(Boolean).map(Number);

    if (refs.length === 0) {
      setError("Escribe las referencias a páginas.");
      setResultado(null);
      return;
    }
    if (refs.some((r) => !Number.isInteger(r) || r < 0)) {
      setError("Usa solo números enteros separados por comas.");
      setResultado(null);
      return;
    }
    if (!Number.isInteger(numMarcos) || numMarcos < 1 || numMarcos > 10) {
      setError("Los marcos deben estar entre 1 y 10.");
      setResultado(null);
      return;
    }

    setError("");
    setUsado({ alg: algoritmo, marcos: numMarcos });
    setResultado(
      algoritmo === "FIFO" ? fifo(refs, numMarcos) : lfu(refs, numMarcos)
    );
  }

  const fuente = { fontSize: "clamp(0.55rem, 1.3vw, 1rem)" };
  const celda =
    "border border-gray-500 h-11 p-0 text-center overflow-hidden whitespace-nowrap";

  function textoCelda(i: number, m: number) {
    const p = resultado!.pasos[i];
    const pagina = p.marcos[m];
    if (pagina === null) return "";
    if (usado.alg === "LFU" && p.contadores)
      return `${pagina}(${p.contadores[m]})`;
    return String(pagina);
  }

  function cambio(i: number, m: number) {
    const actual = resultado!.pasos[i].marcos[m];
    const previo = i === 0 ? null : resultado!.pasos[i - 1].marcos[m];
    return actual !== previo;
  }

  const total = resultado ? resultado.pasos.length : 0;
  const tasa = resultado ? Math.round((resultado.fallos / total) * 100) : 0;

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Simulador de reemplazo de páginas</h1>
      <p className="mb-6 text-sm text-gray-400">
        Memoria virtual · algoritmos FIFO y LFU
      </p>

      {/* CONTROLES */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          calcular();
        }}
        className="mb-6 flex flex-wrap items-end gap-5 rounded-xl border border-gray-600 p-4"
      >
        <div className="flex flex-col gap-1 text-sm">
          Algoritmo
          <div className="flex overflow-hidden rounded-lg border border-gray-500">
            {(["FIFO", "LFU"] as Algoritmo[]).map((a) => (
              <button
                type="button"
                key={a}
                onClick={() => setAlgoritmo(a)}
                className={
                  "px-5 py-2 font-semibold transition " +
                  (algoritmo === a
                    ? "bg-blue-600 text-white"
                    : "bg-transparent text-gray-300 hover:bg-gray-700")
                }
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Marcos
          <input
            type="number"
            min={1}
            max={10}
            className="w-24 rounded-lg border border-gray-500 bg-transparent p-2"
            value={numMarcos}
            onChange={(e) => setNumMarcos(Number(e.target.value))}
          />
        </label>

        <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-sm">
          Referencias (separadas por comas)
          <input
            className="rounded-lg border border-gray-500 bg-transparent p-2"
            value={refsTexto}
            onChange={(e) => setRefsTexto(e.target.value)}
          />
        </label>

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-500"
        >
          Calcular
        </button>
      </form>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      {!resultado && !error && (
        <p className="rounded-xl border border-dashed border-gray-600 p-8 text-center text-gray-400">
          Elige el algoritmo, los marcos y las referencias, y pulsa{" "}
          <strong>Calcular</strong>.
        </p>
      )}

      {resultado && (
        <>
          {/* TABLA */}
          <section className="rounded-xl border border-gray-600 p-4 sm:p-5">
            <h2 className="text-xl font-bold tracking-wide">
              ALGORITMO {usado.alg}
            </h2>
            <p className="mb-4 text-sm text-gray-400">
              {DESCRIPCION[usado.alg]}
            </p>

            <table className="w-full table-fixed border-collapse" style={fuente}>
              <colgroup>
                <col style={{ width: "6rem" }} />
                <col style={{ width: "2.5rem" }} />
                {resultado.pasos.map((_, i) => (
                  <col key={i} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th colSpan={2} />
                  <th
                    colSpan={total}
                    className="pb-2 text-center font-bold tracking-wide text-red-500"
                  >
                    Páginas solicitadas
                  </th>
                </tr>
                <tr>
                  <th colSpan={2} />
                  {resultado.pasos.map((p, i) => (
                    <th
                      key={i}
                      className={celda + " bg-gray-500/10 font-bold text-red-500"}
                    >
                      {p.referencia}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: usado.marcos }).map((_, m) => (
                  <tr key={m}>
                    {m === 0 && (
                      <td
                        rowSpan={usado.marcos}
                        className="pr-6 text-right font-bold text-sky-400"
                      >
                        MARCOS
                      </td>
                    )}
                    <td className="pr-2 text-center font-bold text-sky-400">
                      {m}
                    </td>
                    {resultado.pasos.map((_, i) => (
                      <td
                        key={i}
                        className={
                          celda +
                          (cambio(i, m) ? " bg-red-500/20 font-semibold" : "")
                        }
                      >
                        {textoCelda(i, m)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td colSpan={2} className="pr-4 pt-2 text-right text-gray-400">
                    Fallo
                  </td>
                  {resultado.pasos.map((p, i) => (
                    <td
                      key={i}
                      className="pt-2 text-center font-bold text-red-500"
                    >
                      {p.fallo ? "F" : ""}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td colSpan={2} className="pr-4 text-right text-gray-400">
                    Sale
                  </td>
                  {resultado.pasos.map((p, i) => (
                    <td key={i} className="text-center text-gray-400">
                      {p.sale ?? ""}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            <p className="mt-3 text-xs text-gray-400">
              Las celdas resaltadas son las páginas que se cargaron en ese paso.
            </p>
          </section>

          {/* TOTALES (fuera de la tabla) */}
          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-600 p-4">
              <p className="text-sm text-gray-400">Total fallos de página</p>
              <p className="text-3xl font-bold text-red-500">{resultado.fallos}</p>
            </div>
            <div className="rounded-xl border border-gray-600 p-4">
              <p className="text-sm text-gray-400">Aciertos</p>
              <p className="text-3xl font-bold text-green-500">
                {resultado.aciertos}
              </p>
            </div>
            <div className="rounded-xl border border-gray-600 p-4">
              <p className="text-sm text-gray-400">Tasa de fallos</p>
              <p className="text-3xl font-bold">{tasa}%</p>
            </div>
          </section>
        </>
      )}
    </main>
  );
}