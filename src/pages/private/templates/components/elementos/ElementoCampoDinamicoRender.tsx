// src/pages/private/templates/components/elementos/ElementoCampoDinamicoRender.tsx

import type {
  ElementoCampoDinamico,
  DatosEjemploTicket,
  FormatoFecha,
  FormatoHora,
  PosicionEtiqueta,
} from '@dto/template.types';
import { DATOS_EJEMPLO_TICKET } from '@dto/template.types';
import { useDetectarOverflow } from '../../hooks/useDetectarOverflow';

interface ElementoCampoDinamicoRenderProps {
  elemento: ElementoCampoDinamico;
  preview: boolean;
}

// ==========================================
// RESOLUCION DE CAMPOS
// ==========================================

function formatearFecha(formato: FormatoFecha): string {
  const ahora = new Date();
  switch (formato) {
    case 'corta':
      return ahora.toLocaleDateString('es-PY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    case 'larga':
      return ahora.toLocaleDateString('es-PY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    case 'completa':
      return ahora.toLocaleDateString('es-PY', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
  }
}

function formatearHora(formato: FormatoHora): string {
  const ahora = new Date();
  switch (formato) {
    case '24h':
      return ahora.toLocaleTimeString('es-PY', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    case '12h':
      return ahora.toLocaleTimeString('es-PY', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
  }
}

function resolverCampo(
  campo: string,
  datos: DatosEjemploTicket,
  formatoFecha: FormatoFecha,
  formatoHora: FormatoHora,
): string {
  if (campo === '{{fecha_hora}}') {
    return `${formatearFecha(formatoFecha)} ${formatearHora(formatoHora)}`;
  }
  const clave = campo.replace(/\{\{|\}\}/g, '') as keyof DatosEjemploTicket;
  return datos[clave] ?? campo;
}

// ==========================================
// ALINEACION DE ETIQUETA
// ==========================================

function obtenerAlineacionEtiqueta(
  posicion: PosicionEtiqueta,
): 'left' | 'center' | 'right' {
  if (posicion.endsWith('_izq') || posicion === 'izq') return 'left';
  if (posicion.endsWith('_centro') || posicion === 'centro') return 'center';
  if (posicion.endsWith('_der') || posicion === 'der') return 'right';
  return 'left';
}

function esInline(posicion: PosicionEtiqueta): boolean {
  return posicion === 'izq' || posicion === 'centro' || posicion === 'der';
}

function esArriba(posicion: PosicionEtiqueta): boolean {
  return (
    posicion === 'arriba_izq' ||
    posicion === 'arriba_centro' ||
    posicion === 'arriba_der'
  );
}

// ==========================================
// COMPONENTE DE ETIQUETA
// ==========================================

interface EtiquetaRenderProps {
  texto: string;
  tamanoFuente: number;
  negrita: boolean;
  cursiva: boolean;
  alineacion: 'left' | 'center' | 'right';
  inline: boolean;
}

function EtiquetaRender({
  texto,
  tamanoFuente,
  negrita,
  cursiva,
  alineacion,
  inline,
}: EtiquetaRenderProps) {
  return (
    <span
      className="text-gray-500 leading-tight"
      style={{
        fontSize: `${tamanoFuente}px`,
        fontWeight: negrita ? 'bold' : 'normal',
        fontStyle: cursiva ? 'italic' : 'normal',
        textAlign: alineacion,
        marginRight: inline ? '4px' : undefined,
        whiteSpace: inline ? 'nowrap' : undefined,
      }}
    >
      {texto}:
    </span>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

function ElementoCampoDinamicoRender({
  elemento,
  preview,
}: ElementoCampoDinamicoRenderProps) {
  const { propiedades } = elemento;

  const valorMostrar = preview
    ? resolverCampo(
        propiedades.campo,
        DATOS_EJEMPLO_TICKET,
        propiedades.formato_fecha,
        propiedades.formato_hora,
      )
    : propiedades.campo;

  const { ref, tieneOverflow } = useDetectarOverflow([
    valorMostrar,
    propiedades.tamano_fuente,
    propiedades.negrita,
    propiedades.mostrar_etiqueta,
    propiedades.posicion_etiqueta,
    propiedades.etiqueta_tamano_fuente,
    propiedades.etiqueta_negrita,
    elemento.ancho,
    elemento.alto,
  ]);

  const alineacionEtiqueta = obtenerAlineacionEtiqueta(
    propiedades.posicion_etiqueta,
  );
  const inline = esInline(propiedades.posicion_etiqueta);
  const arriba = esArriba(propiedades.posicion_etiqueta);

  const etiquetaComponente = propiedades.mostrar_etiqueta ? (
    <EtiquetaRender
      texto={propiedades.etiqueta}
      tamanoFuente={propiedades.etiqueta_tamano_fuente}
      negrita={propiedades.etiqueta_negrita}
      cursiva={propiedades.etiqueta_cursiva}
      alineacion={alineacionEtiqueta}
      inline={inline}
    />
  ) : null;

  const valorComponente = (
    <span className="leading-tight">{valorMostrar}</span>
  );

  // Layout inline: etiqueta y valor en la misma linea
  if (inline && propiedades.mostrar_etiqueta) {
    return (
      <div className="relative h-full w-full">
        <div
          ref={ref}
          className="flex h-full w-full items-center overflow-hidden px-1"
          style={{
            fontSize: `${propiedades.tamano_fuente}px`,
            fontWeight: propiedades.negrita ? 'bold' : 'normal',
            fontStyle: propiedades.cursiva ? 'italic' : 'normal',
            textAlign: propiedades.alineacion,
            lineHeight: 1.3,
            wordBreak: 'break-word',
          }}
        >
          {etiquetaComponente}
          {valorComponente}
        </div>
        {tieneOverflow && (
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center">
            <span className="rounded-t bg-red-500 px-1.5 py-0.5 text-[8px] font-medium text-white">
              No entra
            </span>
          </div>
        )}
      </div>
    );
  }

  // Layout vertical: etiqueta arriba o abajo del valor
  return (
    <div className="relative h-full w-full">
      <div
        ref={ref}
        className="flex h-full w-full flex-col justify-center overflow-hidden px-1"
        style={{
          fontSize: `${propiedades.tamano_fuente}px`,
          fontWeight: propiedades.negrita ? 'bold' : 'normal',
          fontStyle: propiedades.cursiva ? 'italic' : 'normal',
          textAlign: propiedades.alineacion,
          lineHeight: 1.3,
          wordBreak: 'break-word',
        }}
      >
        {arriba && etiquetaComponente}
        {valorComponente}
        {!arriba && etiquetaComponente}
      </div>
      {tieneOverflow && (
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center">
          <span className="rounded-t bg-red-500 px-1.5 py-0.5 text-[8px] font-medium text-white">
            No entra
          </span>
        </div>
      )}
    </div>
  );
}

export default ElementoCampoDinamicoRender;