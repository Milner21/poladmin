// src/pages/private/templates/components/elementos/ElementoQRRender.tsx

import type { ElementoQR } from '@dto/template.types';
import { DATOS_EJEMPLO_TICKET } from '@dto/template.types';
import { QrCode } from 'lucide-react';

interface ElementoQRRenderProps {
  elemento: ElementoQR;
  preview: boolean;
}

function ElementoQRRender({ elemento, preview }: ElementoQRRenderProps) {
  const { propiedades } = elemento;
  const valor = preview ? DATOS_EJEMPLO_TICKET.pin : propiedades.campo;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1">
      <div
        className="flex items-center justify-center border border-gray-300 bg-white"
        style={{
          width: `${propiedades.tamano}px`,
          height: `${propiedades.tamano}px`,
        }}
      >
        <QrCode
          size={Math.max(propiedades.tamano - 8, 16)}
          className="text-gray-700"
        />
      </div>
      <span className="text-[8px] text-gray-400">{valor}</span>
    </div>
  );
}

export default ElementoQRRender;