// src/pages/private/templates/components/CanvasTicket.tsx

import { useCallback, useRef } from 'react';
import type { DragEvent, MouseEvent } from 'react';
import type {
  ElementoTemplate,
  TipoElemento,
  AnchoPapel,
} from '@dto/template.types';
import { ANCHO_CANVAS_PX } from '@dto/template.types';
import { crearElementoPorTipo } from '../utils/crearElemento';
import {
  ElementoImagenRender,
  ElementoTextoRender,
  ElementoCampoDinamicoRender,
  ElementoQRRender,
  ElementoSeparadorRender,
} from './elementos';

interface CanvasTicketProps {
  elementos: ElementoTemplate[];
  anchoPapel: AnchoPapel;
  elementoSeleccionadoId: string | null;
  preview: boolean;
  onAgregarElemento: (elemento: ElementoTemplate) => void;
  onSeleccionarElemento: (id: string | null) => void;
  onMoverElemento: (id: string, x: number, y: number) => void;
}

function CanvasTicket({
  elementos,
  anchoPapel,
  elementoSeleccionadoId,
  preview,
  onAgregarElemento,
  onSeleccionarElemento,
  onMoverElemento,
}: CanvasTicketProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const anchoCanvas = ANCHO_CANVAS_PX[anchoPapel];

  // Calcular alto minimo basado en los elementos
  const altoMinimo = elementos.reduce((max, elem) => {
    return Math.max(max, elem.y + elem.alto + 20);
  }, 300);

  // Soltar elemento nuevo desde la toolbar
  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const tipo = e.dataTransfer.getData('tipo-elemento') as TipoElemento;
      if (!tipo || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);

      const ordenSiguiente =
        elementos.length > 0
          ? Math.max(...elementos.map((el) => el.orden)) + 1
          : 0;

      const nuevoElemento = crearElementoPorTipo(tipo, { x, y }, anchoPapel, ordenSiguiente);
      onAgregarElemento(nuevoElemento);
    },
    [elementos, anchoPapel, onAgregarElemento],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // Click en el canvas vacio deselecciona
  const handleCanvasClick = useCallback(() => {
    onSeleccionarElemento(null);
  }, [onSeleccionarElemento]);

  // Iniciar arrastre de elemento existente
  const handleElementoMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>, elemento: ElementoTemplate) => {
      if (preview) return;
      e.stopPropagation();
      onSeleccionarElemento(elemento.id);

      const rect = e.currentTarget.getBoundingClientRect();
      dragRef.current = {
        id: elemento.id,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
      };

      const handleMouseMove = (ev: globalThis.MouseEvent) => {
        if (!dragRef.current || !canvasRef.current) return;
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const nuevoX = Math.round(ev.clientX - canvasRect.left - dragRef.current.offsetX);
        const nuevoY = Math.round(ev.clientY - canvasRect.top - dragRef.current.offsetY);
        onMoverElemento(dragRef.current.id, Math.max(0, nuevoX), Math.max(0, nuevoY));
      };

      const handleMouseUp = () => {
        dragRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [preview, onSeleccionarElemento, onMoverElemento],
  );

  // Renderizar cada elemento segun su tipo
  const renderizarElemento = useCallback(
    (elemento: ElementoTemplate) => {
      switch (elemento.tipo) {
        case 'IMAGEN':
          return <ElementoImagenRender elemento={elemento} />;
        case 'TEXTO':
          return <ElementoTextoRender elemento={elemento} />;
        case 'CAMPO_DINAMICO':
          return (
            <ElementoCampoDinamicoRender
              elemento={elemento}
              preview={preview}
            />
          );
        case 'QR':
          return <ElementoQRRender elemento={elemento} preview={preview} />;
        case 'SEPARADOR':
          return <ElementoSeparadorRender elemento={elemento} />;
      }
    },
    [preview],
  );

  const estaSeleccionado = (id: string): boolean => id === elementoSeleccionadoId;

  return (
    <div className="flex flex-1 flex-col items-center overflow-auto bg-gray-100 p-4">
      <div className="mb-2 text-xs text-gray-500">
        {anchoPapel}mm - {anchoCanvas}px
      </div>
      <div
        ref={canvasRef}
        className="relative bg-white shadow-lg"
        style={{
          width: `${anchoCanvas}px`,
          minHeight: `${altoMinimo}px`,
          border: '1px solid #d1d5db',
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleCanvasClick}
      >
        {elementos
          .slice()
          .sort((a, b) => a.orden - b.orden)
          .map((elemento) => (
            <div
              key={elemento.id}
              className={`absolute ${
                preview
                  ? ''
                  : 'cursor-move hover:outline-1 hover:outline-blue-300'
              } ${
                estaSeleccionado(elemento.id) && !preview
                  ? 'outline-2 outline-blue-500 ring-2 ring-blue-200'
                  : ''
              }`}
              style={{
                left: `${elemento.x}px`,
                top: `${elemento.y}px`,
                width: `${elemento.ancho}px`,
                height: `${elemento.alto}px`,
              }}
              onMouseDown={(e) => handleElementoMouseDown(e, elemento)}
              onClick={(e) => e.stopPropagation()}
            >
              {renderizarElemento(elemento)}
            </div>
          ))}

        {elementos.length === 0 && !preview && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
            Arrastra elementos aqui
          </div>
        )}
      </div>
    </div>
  );
}

export default CanvasTicket;