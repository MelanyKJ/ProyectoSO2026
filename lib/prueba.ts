import { lfu } from "./lfu";

const a = lfu([4, 3, 4, 2, 4, 3, 1, 2, 1, 4], 3);
console.log("Ejercicio 7 (LFU). Fallos:", a.fallos);

const b = lfu([7,0,1,2,0,2,0,2,4,0,2,0,1,3,0,1,2,7,0,1], 3);
console.log("Ejemplo del profesor. Fallos:", b.fallos);