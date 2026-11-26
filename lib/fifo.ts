export type Paso = {
  referencia: number;
  marcos: (number | null)[];
  fallo: boolean;
  sale: number | null;
  contadores?: number[]; // solo lo usa LFU
};

export type Resultado = {
  pasos: Paso[];
  fallos: number;
  aciertos: number;
};

export function fifo(referencias: number[], numMarcos: number): Resultado {
  const marcos: (number | null)[] = Array(numMarcos).fill(null);
  let siguiente = 0; // marco con la página más antigua
  let fallos = 0;
  const pasos: Paso[] = [];

  for (const ref of referencias) {
    let fallo = false;
    let sale: number | null = null;

    if (!marcos.includes(ref)) {
      fallo = true;
      fallos++;
      sale = marcos[siguiente];
      marcos[siguiente] = ref;
      siguiente = (siguiente + 1) % numMarcos;
    }

    pasos.push({ referencia: ref, marcos: [...marcos], fallo, sale });
  }

  return { pasos, fallos, aciertos: referencias.length - fallos };
}