export type Proceso = {
  nombre: string;
  llegada: number;
  rafaga: number;
  prioridad: number; // solo lo usa Prioridades (menor número = mayor prioridad)
};

// Un tramo del diagrama de Gantt. proceso = null significa CPU ociosa.
export type Tramo = {
  proceso: string | null;
  inicio: number;
  fin: number;
};

export type Metricas = {
  nombre: string;
  llegada: number;
  rafaga: number;
  prioridad: number;
  comienzo: number; // primera vez que usa la CPU
  fin: number;
  retorno: number; // fin - llegada
  espera: number; // retorno - ráfaga
  respuesta: number; // comienzo - llegada
};

export type ResultadoPlanificacion = {
  gantt: Tramo[];
  procesos: Metricas[];
  esperaPromedio: number;
  retornoPromedio: number;
  respuestaPromedio: number;
};

// Añade un tramo al Gantt, uniéndolo con el anterior si es del mismo proceso.
export function agregarTramo(gantt: Tramo[], proceso: string | null, inicio: number, fin: number) {
  if (fin <= inicio) return;
  const ultimo = gantt[gantt.length - 1];
  if (ultimo && ultimo.proceso === proceso && ultimo.fin === inicio) {
    ultimo.fin = fin;
  } else {
    gantt.push({ proceso, inicio, fin });
  }
}

export function calcularMetricas(
  procesos: Proceso[],
  comienzo: Map<string, number>,
  fin: Map<string, number>,
  gantt: Tramo[]
): ResultadoPlanificacion {
  const metricas: Metricas[] = procesos.map((p) => {
    const c = comienzo.get(p.nombre)!;
    const f = fin.get(p.nombre)!;
    const retorno = f - p.llegada;
    return {
      nombre: p.nombre,
      llegada: p.llegada,
      rafaga: p.rafaga,
      prioridad: p.prioridad,
      comienzo: c,
      fin: f,
      retorno,
      espera: retorno - p.rafaga,
      respuesta: c - p.llegada,
    };
  });

  const n = metricas.length;
  const promedio = (k: "espera" | "retorno" | "respuesta") =>
    n === 0 ? 0 : metricas.reduce((s, m) => s + m[k], 0) / n;

  return {
    gantt,
    procesos: metricas,
    esperaPromedio: promedio("espera"),
    retornoPromedio: promedio("retorno"),
    respuestaPromedio: promedio("respuesta"),
  };
}
