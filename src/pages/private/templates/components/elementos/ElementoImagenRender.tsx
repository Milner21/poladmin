// src/pages/private/templates/components/elementos/ElementoImagenRender.tsx

import type { ElementoImagen } from '@dto/template.types';

interface ElementoImagenRenderProps {
  elemento: ElementoImagen;
}

function ElementoImagenRender({ elemento }: ElementoImagenRenderProps) {
  const { propiedades } = elemento;

  if (!propiedades.src) {
    return (
      <div className="flex h-full w-full items-center justify-center border-2 border-dashed border-gray-300 bg-gray-100 text-xs text-gray-400">
        Sin imagen
      </div>
    );
  }

  return (
    <img
      src={propiedades.src}
      alt="Elemento imagen"
      draggable={false}
      className="h-full w-full"
      style={{ objectFit: propiedades.ajuste }}
    />
  );
}

export default ElementoImagenRender;