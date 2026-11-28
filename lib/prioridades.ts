import {
  agregarTramo,
  calcularMetricas,
  type Proceso,
  type ResultadoPlanificacion,
  type Tramo,
} from "./planificacion";

/**
 * Prioridades NO expropiativo.
 * Cuando la CPU queda libre se elige, entre los procesos que ya llegaron, el de
 * mayor prioridad (menor número). Ese proceso se ejecuta hasta terminar.
 * Empates: primero el que llegó antes; luego el orden de ingreso.
 */
export function prioridades(procesos: Proceso[]): ResultadoPlanificacion {
  const pendientes = procesos.map((p, i) => ({ p, i }));
  const comienzo = new Map<string, number>();
  const fin = new Map<string, number>();
  const gantt: Tramo[] = [];
  let t = 0;

  while (pendientes.length > 0) {
    const listos = pendientes.filter((x) => x.p.llegada <= t);

    if (listos.length === 0) {
      const proxima = Math.min(...pendientes.map((x) => x.p.llegada));
      agregarTramo(gantt, null, t, proxima);
      t = proxima;
      continue;
    }

    listos.sort(
      (a, b) =>
        a.p.prioridad - b.p.prioridad || a.p.llegada - b.p.llegada || a.i - b.i
    );
    const elegido = listos[0];

    comienzo.set(elegido.p.nombre, t);
    agregarTramo(gantt, elegido.p.nombre, t, t + elegido.p.rafaga);
    t += elegido.p.rafaga;
    fin.set(elegido.p.nombre, t);

    pendientes.splice(pendientes.indexOf(elegido), 1);
  }

  return calcularMetricas(procesos, comienzo, fin, gantt);
}
