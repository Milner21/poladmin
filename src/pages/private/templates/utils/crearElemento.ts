// src/pages/private/templates/utils/crearElemento.ts

import type {
  TipoElemento,
  ElementoTemplate,
  ElementoImagen,
  ElementoTexto,
  ElementoCampoDinamico,
  ElementoQR,
  ElementoSeparador,
  AnchoPapel,
} from "@dto/template.types";
import { ANCHO_CANVAS_PX } from "@dto/template.types";

let contadorElementos = 0;

function generarId(): string {
  contadorElementos += 1;
  return `elem-${Date.now()}-${contadorElementos}`;
}

interface PosicionDrop {
  x: number;
  y: number;
}

export function crearElementoPorTipo(
  tipo: TipoElemento,
  posicion: PosicionDrop,
  anchoPapel: AnchoPapel,
  ordenSiguiente: number,
): ElementoTemplate {
  const anchoCanvas = ANCHO_CANVAS_PX[anchoPapel];
  const id = generarId();

  const base = {
    id,
    x: posicion.x,
    y: posicion.y,
    orden: ordenSiguiente,
  };

  switch (tipo) {
    case "IMAGEN": {
      const elemento: ElementoImagen = {
        ...base,
        tipo: "IMAGEN",
        ancho: Math.round(anchoCanvas * 0.5),
        alto: 60,
        propiedades: {
          src: "",
          ajuste: "contain",
        },
      };
      return elemento;
    }

    case "TEXTO": {
      const elemento: ElementoTexto = {
        ...base,
        tipo: "TEXTO",
        ancho: Math.round(anchoCanvas * 0.9),
        alto: 30,
        propiedades: {
          contenido: "Texto de ejemplo",
          tamano_fuente: 12,
          negrita: false,
          cursiva: false,
          alineacion: "center",
        },
      };
      return elemento;
    }

    case "CAMPO_DINAMICO": {
      const elemento: ElementoCampoDinamico = {
        ...base,
        tipo: "CAMPO_DINAMICO",
        ancho: Math.round(anchoCanvas * 0.9),
        alto: 36,
        propiedades: {
          campo: "{{nombre}}",
          formato_fecha: "corta",
          formato_hora: "24h",
          etiqueta: "Nombre",
          posicion_etiqueta: "izq",
          tamano_fuente: 14,
          negrita: true,
          cursiva: false,
          alineacion: "center",
          mostrar_etiqueta: true,
          etiqueta_tamano_fuente: 9,
          etiqueta_negrita: false,
          etiqueta_cursiva: false,
        },
      };
      return elemento;
    }

    case "QR": {
      const elemento: ElementoQR = {
        ...base,
        tipo: "QR",
        ancho: 80,
        alto: 80,
        propiedades: {
          campo: "{{pin}}",
          tamano: 64,
        },
      };
      return elemento;
    }

    case "SEPARADOR": {
      const elemento: ElementoSeparador = {
        ...base,
        tipo: "SEPARADOR",
        ancho: Math.round(anchoCanvas * 0.95),
        alto: 10,
        propiedades: {
          estilo: "punteado",
          grosor: 1,
        },
      };
      return elemento;
    }
  }
}
