// src/pages/private/templates/utils/clonarElemento.ts

import type { ElementoTemplate } from '@dto/template.types';

let contadorClones = 0;

function generarIdClon(): string {
  contadorClones += 1;
  return `clon-${Date.now()}-${contadorClones}`;
}

const OFFSET_PX = 12;

export function clonarElemento(
  original: ElementoTemplate,
  ordenSiguiente: number,
): ElementoTemplate {
  const copia = JSON.parse(JSON.stringify(original)) as ElementoTemplate;

  copia.id = generarIdClon();
  copia.x = original.x + OFFSET_PX;
  copia.y = original.y + OFFSET_PX;
  copia.orden = ordenSiguiente;

  return copia;
}