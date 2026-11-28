"use client";
import { useState } from "react";
import type { Proceso, ResultadoPlanificacion } from "../../lib/planificacion";
import { roundRobin } from "../../lib/roundRobin";
import { prioridades } from "../../lib/prioridades";

type Algoritmo = "RR" | "PRIORIDADES";

const NOMBRE: Record<Algoritmo, string> = {
  RR: "Round Robin",
  PRIORIDADES: "Prioridades",
};

const DESCRIPCION: Record<Algoritmo, string> = {
  RR: "Cada proceso usa la CPU como máximo un quantum y vuelve al final de la cola. Los que llegan durante el quantum entran a la cola antes que el proceso expropiado.",
  PRIORIDADES:
    "No expropiativo: al quedar libre la CPU se elige el proceso listo con mayor prioridad (menor número) y se ejecuta hasta terminar. Empate: el que llegó primero.",
};

const COLORES = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-fuchsia-600",
  "bg-cyan-600",
  "bg-rose-600",
  "bg-lime-600",
  "bg-violet-600",
  "bg-orange-600",
  "bg-teal-600",
];

type Fila = { llegada: string; rafaga: string; prioridad: string };

const EJEMPLO: Fila[] = [
  { llegada: "0", rafaga: "5", prioridad: "3" },
  { llegada: "1", rafaga: "3", prioridad: "1" },
  { llegada: "2", rafaga: "8", prioridad: "4" },
  { llegada: "3", rafaga: "6", prioridad: "2" },
];

const nombreDe = (i: number) => `P${i + 1}`;

export default function Planificacion() {
  // Lo que el usuario escribe
  const [algoritmo, setAlgoritmo] = useState<Algoritmo>("RR");
  const [quantum, setQuantum] = useState(2);
  const [filas, setFilas] = useState<Fila[]>(EJEMPLO);

  // Lo que se calculó al pulsar "Calcular"
  const [resultado, setResultado] = useState<ResultadoPlanificacion | null>(null);
  const [usado, setUsado] = useState<{ alg: Algoritmo; quantum: number }>({
    alg: "RR",
    quantum: 2,
  });
  const [error, setError] = useState("");

  function editar(i: number, campo: keyof Fila, valor: string) {
    setFilas((fs) => fs.map((f, j) => (j === i ? { ...f, [campo]: valor } : f)));
  }

  function agregar() {
    if (filas.length >= 10) return;
    setFilas((fs) => [...fs, { llegada: "0", rafaga: "1", prioridad: "1" }]);
  }

  function quitar(i: number) {
    setFilas((fs) => fs.filter((_, j) => j !== i));
  }

  function calcular() {
    const fallar = (msg: string) => {
      setError(msg);
      setResultado(null);
    };

    if (filas.length === 0) return fallar("Agrega al menos un proceso.");

    // Convierte el texto a entero; devuelve null si no es válido
    const leer = (texto: string, min: number) => {
      const n = Number(texto);
      return texto.trim() !== "" && Number.isInteger(n) && n >= min ? n : null;
    };

    const procesos: Proceso[] = [];
    for (let i = 0; i < filas.length; i++) {
      const llegada = leer(filas[i].llegada, 0);
      const rafaga = leer(filas[i].rafaga, 1);
      const prioridad = leer(filas[i].prioridad, 0);
      if (llegada === null)
        return fallar(`${nombreDe(i)}: la llegada debe ser un entero ≥ 0.`);
      if (rafaga === null)
        return fallar(`${nombreDe(i)}: la ráfaga debe ser un entero ≥ 1.`);
      if (algoritmo === "PRIORIDADES" && prioridad === null)
        return fallar(`${nombreDe(i)}: la prioridad debe ser un entero ≥ 0.`);
      procesos.push({ nombre: nombreDe(i), llegada, rafaga, prioridad: prioridad ?? 0 });
    }

    if (algoritmo === "RR" && (!Number.isInteger(quantum) || quantum < 1 || quantum > 20))
      return fallar("El quantum debe estar entre 1 y 20.");

    setError("");
    setUsado({ alg: algoritmo, quantum });
    setResultado(
      algoritmo === "RR" ? roundRobin(procesos, quantum) : prioridades(procesos)
    );
  }

  const colorDe = (nombre: string) =>
    COLORES[(Number(nombre.slice(1)) - 1) % COLORES.length];

  const duracion = resultado
    ? resultado.gantt[resultado.gantt.length - 1].fin - resultado.gantt[0].inicio
    : 0;

  const input =
    "w-full rounded-lg border border-gray-500 bg-transparent p-2 text-center";
  const celda = "border border-gray-500 p-2 text-center";
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Simulador de planificación de procesos</h1>
      <p className="mb-6 text-sm text-gray-400">
        CPU · algoritmos Round Robin y por prioridades no expropiativo
      </p>

      {/* CONTROLES */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          calcular();
        }}
        className="mb-6 rounded-xl border border-gray-600 p-4"
      >
        <div className="mb-4 flex flex-wrap items-end gap-5">
          <div className="flex flex-col gap-1 text-sm">
            Algoritmo
            <div className="flex overflow-hidden rounded-lg border border-gray-500">
              {(["RR", "PRIORIDADES"] as Algoritmo[]).map((a) => (
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
                  {NOMBRE[a]}
                </button>
              ))}
            </div>
          </div>

          {algoritmo === "RR" && (
            <label className="flex flex-col gap-1 text-sm">
              Quantum
              <input
                type="number"
                min={1}
                max={20}
                className="w-24 rounded-lg border border-gray-500 bg-transparent p-2"
                value={quantum}
                onChange={(e) => setQuantum(Number(e.target.value))}
              />
            </label>
          )}
        </div>

        {/* TABLA DE PROCESOS */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr className="text-gray-400">
                <th className="p-2 text-left">Proceso</th>
                <th className="p-2">Llegada</th>
                <th className="p-2">Ráfaga (CPU)</th>
                {algoritmo === "PRIORIDADES" && <th className="p-2">Prioridad</th>}
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={i}>
                  <td className="p-1 font-bold">
                    <span
                      className={
                        "inline-block rounded px-2 py-1 text-white " +
                        COLORES[i % COLORES.length]
                      }
                    >
                      {nombreDe(i)}
                    </span>
                  </td>
                  <td className="p-1">
                    <input
                      type="number"
                      min={0}
                      className={input}
                      value={f.llegada}
                      onChange={(e) => editar(i, "llegada", e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="number"
                      min={1}
                      className={input}
                      value={f.rafaga}
                      onChange={(e) => editar(i, "rafaga", e.target.value)}
                    />
                  </td>
                  {algoritmo === "PRIORIDADES" && (
                    <td className="p-1">
                      <input
                        type="number"
                        min={0}
                        className={input}
                        value={f.prioridad}
                        onChange={(e) => editar(i, "prioridad", e.target.value)}
                      />
                    </td>
                  )}
                  <td className="p-1 text-center">
                    <button
                      type="button"
                      onClick={() => quitar(i)}
                      className="rounded-lg px-3 py-1 text-gray-400 transition hover:bg-gray-700 hover:text-red-400"
                      aria-label={`Quitar ${nombreDe(i)}`}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {algoritmo === "PRIORIDADES" && (
          <p className="mt-2 text-xs text-gray-400">
            Menor número = mayor prioridad.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={agregar}
            disabled={filas.length >= 10}
            className="rounded-lg border border-gray-500 px-4 py-2 transition hover:bg-gray-700 disabled:opacity-40"
          >
            + Agregar proceso
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-500"
          >
            Calcular
          </button>
        </div>
      </form>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      {!resultado && !error && (
        <p className="rounded-xl border border-dashed border-gray-600 p-8 text-center text-gray-400">
          Elige el algoritmo, ingresa los procesos y pulsa{" "}
          <strong>Calcular</strong>.
        </p>
      )}

      {resultado && (
        <>
          {/* DIAGRAMA DE GANTT */}
          <section className="rounded-xl border border-gray-600 p-4 sm:p-5">
            <h2 className="text-xl font-bold tracking-wide">
              ALGORITMO {NOMBRE[usado.alg].toUpperCase()}
              {usado.alg === "RR" && ` (quantum = ${usado.quantum})`}
            </h2>
            <p className="mb-4 text-sm text-gray-400">{DESCRIPCION[usado.alg]}</p>

            <h3 className="mb-2 font-bold text-sky-400">Diagrama de Gantt</h3>
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[480px]">
                <div className="flex h-12 overflow-hidden rounded-lg border border-gray-500">
                  {resultado.gantt.map((tr, i) => (
                    <div
                      key={i}
                      style={{ flexGrow: tr.fin - tr.inicio, flexBasis: 0 }}
                      className={
                        "flex items-center justify-center border-r border-gray-900/40 text-sm font-bold last:border-r-0 " +
                        (tr.proceso
                          ? colorDe(tr.proceso) + " text-white"
                          : "bg-gray-500/20 text-gray-400")
                      }
                      title={`${tr.proceso ?? "Ocioso"}: ${tr.inicio} → ${tr.fin}`}
                    >
                      {tr.proceso ?? "—"}
                    </div>
                  ))}
                </div>
                <div className="relative h-5 text-xs text-gray-400">
                  {[resultado.gantt[0].inicio, ...resultado.gantt.map((tr) => tr.fin)].map(
                    (t, i) => (
                      <span
                        key={i}
                        className="absolute -translate-x-1/2"
                        style={{
                          left: `${((t - resultado.gantt[0].inicio) / duracion) * 100}%`,
                        }}
                      >
                        {t}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Los tramos “—” indican que la CPU estuvo ociosa.
            </p>

            {/* TABLA DE RESULTADOS */}
            <h3 className="mb-2 mt-6 font-bold text-sky-400">Tiempos por proceso</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-500/10">
                    <th className={celda}>Proceso</th>
                    <th className={celda}>Llegada</th>
                    <th className={celda}>Ráfaga</th>
                    {usado.alg === "PRIORIDADES" && <th className={celda}>Prioridad</th>}
                    <th className={celda}>Comienzo</th>
                    <th className={celda}>Fin</th>
                    <th className={celda}>Retorno</th>
                    <th className={celda}>Espera</th>
                    <th className={celda}>Respuesta</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.procesos.map((m) => (
                    <tr key={m.nombre}>
                      <td className={celda + " font-bold"}>{m.nombre}</td>
                      <td className={celda}>{m.llegada}</td>
                      <td className={celda}>{m.rafaga}</td>
                      {usado.alg === "PRIORIDADES" && (
                        <td className={celda}>{m.prioridad}</td>
                      )}
                      <td className={celda}>{m.comienzo}</td>
                      <td className={celda}>{m.fin}</td>
                      <td className={celda}>{m.retorno}</td>
                      <td className={celda + " font-semibold text-red-500"}>{m.espera}</td>
                      <td className={celda}>{m.respuesta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Retorno = Fin − Llegada · Espera = Retorno − Ráfaga · Respuesta =
              Comienzo − Llegada
            </p>
          </section>

          {/* PROMEDIOS */}
          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-600 p-4">
              <p className="text-sm text-gray-400">Tiempo de espera promedio</p>
              <p className="text-3xl font-bold text-red-500">
                {fmt(resultado.esperaPromedio)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-600 p-4">
              <p className="text-sm text-gray-400">Tiempo de retorno promedio</p>
              <p className="text-3xl font-bold text-green-500">
                {fmt(resultado.retornoPromedio)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-600 p-4">
              <p className="text-sm text-gray-400">Tiempo de respuesta promedio</p>
              <p className="text-3xl font-bold">{fmt(resultado.respuestaPromedio)}</p>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
