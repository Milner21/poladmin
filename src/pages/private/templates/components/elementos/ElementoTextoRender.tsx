// src/pages/private/templates/components/elementos/ElementoTextoRender.tsx

import type { ElementoTexto } from '@dto/template.types';
import { useDetectarOverflow } from '../../hooks/useDetectarOverflow';

interface ElementoTextoRenderProps {
  elemento: ElementoTexto;
}

function ElementoTextoRender({ elemento }: ElementoTextoRenderProps) {
  const { propiedades } = elemento;

  const { ref, tieneOverflow } = useDetectarOverflow([
    propiedades.contenido,
    propiedades.tamano_fuente,
    propiedades.negrita,
    elemento.ancho,
    elemento.alto,
  ]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={ref}
        className="h-full w-full overflow-hidden px-1"
        style={{
          fontSize: `${propiedades.tamano_fuente}px`,
          fontWeight: propiedades.negrita ? 'bold' : 'normal',
          fontStyle: propiedades.cursiva ? 'italic' : 'normal',
          textAlign: propiedades.alineacion,
          lineHeight: 1.3,
          wordBreak: 'break-word',
        }}
      >
        {propiedades.contenido || 'Texto vacio'}
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

export default ElementoTextoRender;