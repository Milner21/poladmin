// src/pages/private/templates/components/elementos/ElementoSeparadorRender.tsx

import type { ElementoSeparador } from '@dto/template.types';

interface ElementoSeparadorRenderProps {
  elemento: ElementoSeparador;
}

function ElementoSeparadorRender({ elemento }: ElementoSeparadorRenderProps) {
  const { propiedades } = elemento;

  const estiloLinea: Record<string, string> = {
    solido: 'solid',
    punteado: 'dotted',
    guiones: 'dashed',
  };

  return (
    <div className="flex h-full w-full items-center px-1">
      <hr
        className="w-full border-gray-700"
        style={{
          borderTopStyle: estiloLinea[propiedades.estilo] as 'solid' | 'dotted' | 'dashed',
          borderTopWidth: `${propiedades.grosor}px`,
        }}
      />
    </div>
  );
}

export default ElementoSeparadorRender;