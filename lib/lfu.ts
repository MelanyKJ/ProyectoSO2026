import type { Paso, Resultado } from "./fifo";

export function lfu(referencias: number[], numMarcos: number): Resultado {
  const marcos: (number | null)[] = Array(numMarcos).fill(null);
  const contador: number[] = Array(numMarcos).fill(0);
  const cargadoEn: number[] = Array(numMarcos).fill(0);
  const pasos: Paso[] = [];
  let fallos = 0;

  referencias.forEach((ref, t) => {
    let fallo = false;
    let sale: number | null = null;
    const idx = marcos.indexOf(ref);

    if (idx !== -1) {
      contador[idx]++; // acierto: sube el contador
    } else {
      fallo = true;
      fallos++;
      let destino = marcos.indexOf(null); // ¿hay marco libre?
      if (destino === -1) {
        destino = 0;
        for (let i = 1; i < numMarcos; i++) {
          const menor = contador[i] < contador[destino];
          const empateMasAntiguo =
            contador[i] === contador[destino] && cargadoEn[i] < cargadoEn[destino];
          if (menor || empateMasAntiguo) destino = i;
        }
      }
      sale = marcos[destino];
      marcos[destino] = ref;
      contador[destino] = 1;
      cargadoEn[destino] = t;
    }

    pasos.push({
      referencia: ref,
      marcos: [...marcos],
      fallo,
      sale,
      contadores: [...contador],
    });
  });

  return { pasos, fallos, aciertos: referencias.length - fallos };
}