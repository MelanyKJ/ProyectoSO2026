import {
  agregarTramo,
  calcularMetricas,
  type Proceso,
  type ResultadoPlanificacion,
  type Tramo,
} from "./planificacion";

/**
 * Round Robin.
 * Cada proceso usa la CPU como máximo `quantum` unidades y vuelve al final de
 * la cola. Los procesos que llegan durante un quantum entran a la cola ANTES
 * que el proceso que acaba de ser expropiado.
 */
export function roundRobin(procesos: Proceso[], quantum: number): ResultadoPlanificacion {
  // Orden por llegada (a igual llegada, se respeta el orden de ingreso)
  const orden = procesos
    .map((p, i) => ({ p, i }))
    .sort((a, b) => a.p.llegada - b.p.llegada || a.i - b.i)
    .map((x) => x.p);

  const restante = new Map(orden.map((p) => [p.nombre, p.rafaga]));
  const comienzo = new Map<string, number>();
  const fin = new Map<string, number>();
  const gantt: Tramo[] = [];
  const cola: Proceso[] = [];

  let t = 0;
  let sig = 0; // siguiente proceso de `orden` que aún no llegó

  const admitirHasta = (tiempo: number) => {
    while (sig < orden.length && orden[sig].llegada <= tiempo) cola.push(orden[sig++]);
  };

  while (fin.size < orden.length) {
    admitirHasta(t);

    if (cola.length === 0) {
      // CPU ociosa hasta la siguiente llegada
      const proxima = orden[sig].llegada;
      agregarTramo(gantt, null, t, proxima);
      t = proxima;
      continue;
    }

    const actual = cola.shift()!;
    if (!comienzo.has(actual.nombre)) comienzo.set(actual.nombre, t);

    const uso = Math.min(quantum, restante.get(actual.nombre)!);
    agregarTramo(gantt, actual.nombre, t, t + uso);
    t += uso;
    restante.set(actual.nombre, restante.get(actual.nombre)! - uso);

    admitirHasta(t); // los que llegaron mientras se ejecutaba

    if (restante.get(actual.nombre)! > 0) cola.push(actual);
    else fin.set(actual.nombre, t);
  }

  return calcularMetricas(procesos, comienzo, fin, gantt);
}
