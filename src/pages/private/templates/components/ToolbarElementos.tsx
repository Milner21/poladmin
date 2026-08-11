// src/pages/private/templates/components/ToolbarElementos.tsx

import { Image, Type, Tag, QrCode, Minus } from 'lucide-react';
import type { TipoElemento } from '@dto/template.types';
import type { DragEvent } from 'react';

interface ItemToolbar {
  tipo: TipoElemento;
  etiqueta: string;
  icono: React.ReactNode;
}

const ITEMS_TOOLBAR: ItemToolbar[] = [
  { tipo: 'IMAGEN', etiqueta: 'Imagen / Logo', icono: <Image size={20} /> },
  { tipo: 'TEXTO', etiqueta: 'Texto libre', icono: <Type size={20} /> },
  { tipo: 'CAMPO_DINAMICO', etiqueta: 'Campo dinamico', icono: <Tag size={20} /> },
  { tipo: 'QR', etiqueta: 'Codigo QR', icono: <QrCode size={20} /> },
  { tipo: 'SEPARADOR', etiqueta: 'Separador', icono: <Minus size={20} /> },
];

function ToolbarElementos() {
  const handleDragStart = (e: DragEvent<HTMLDivElement>, tipo: TipoElemento) => {
    e.dataTransfer.setData('tipo-elemento', tipo);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="w-48 shrink-0 border-r border-gray-200 bg-gray-50 p-3">
      <h3 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Elementos
      </h3>
      <div className="flex flex-col gap-2">
        {ITEMS_TOOLBAR.map((item) => (
          <div
            key={item.tipo}
            draggable
            onDragStart={(e) => handleDragStart(e, item.tipo)}
            className="flex cursor-grab items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:shadow active:cursor-grabbing"
          >
            <span className="text-gray-500">{item.icono}</span>
            <span>{item.etiqueta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ToolbarElementos;