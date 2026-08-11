// src/pages/private/templates/components/PanelPropiedades.tsx

import { useRef, useCallback } from "react";
import { Copy, CopyPlus, Trash2 } from "lucide-react";
import type {
  ElementoTemplate,
  ElementoImagen,
  ElementoTexto,
  ElementoCampoDinamico,
  ElementoQR,
  ElementoSeparador,
  AlineacionTexto,
  AjusteImagen,
  EstiloSeparador,
  CampoDinamico,
  FormatoHora,
  FormatoFecha,
  PosicionEtiqueta,
} from "@dto/template.types";
import { CAMPOS_DINAMICOS_DISPONIBLES } from "@dto/template.types";
import { comprimirImagen } from "../utils/comprimirImagen";

interface PanelPropiedadesProps {
  elemento: ElementoTemplate | null;
  onActualizar: (elemento: ElementoTemplate) => void;
  onEliminar: (id: string) => void;
  onCopiar: (elemento: ElementoTemplate) => void;
  onDuplicar: (elemento: ElementoTemplate) => void;
}

// ==========================================
// COMPONENTES DE CAMPO REUTILIZABLES
// ==========================================

interface CampoNumericoProps {
  etiqueta: string;
  valor: number;
  min?: number;
  max?: number;
  onChange: (valor: number) => void;
}

function CampoNumerico({
  etiqueta,
  valor,
  min,
  max,
  onChange,
}: CampoNumericoProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{etiqueta}</label>
      <input
        type="number"
        value={valor}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
      />
    </div>
  );
}

interface CampoToggleProps {
  etiqueta: string;
  valor: boolean;
  onChange: (valor: boolean) => void;
}

function CampoToggle({ etiqueta, valor, onChange }: CampoToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-xs font-medium text-gray-600">{etiqueta}</span>
      <div
        className={`relative h-5 w-9 rounded-full transition-colors ${
          valor ? "bg-blue-500" : "bg-gray-300"
        }`}
        onClick={() => onChange(!valor)}
      >
        <div
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            valor ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </div>
    </label>
  );
}

interface CampoSelectProps<T extends string> {
  etiqueta: string;
  valor: T;
  opciones: { valor: T; etiqueta: string }[];
  onChange: (valor: T) => void;
}

function CampoSelect<T extends string>({
  etiqueta,
  valor,
  opciones,
  onChange,
}: CampoSelectProps<T>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{etiqueta}</label>
      <select
        value={valor}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
      >
        {opciones.map((op) => (
          <option key={op.valor} value={op.valor}>
            {op.etiqueta}
          </option>
        ))}
      </select>
    </div>
  );
}

// ==========================================
// SECCION DE POSICION Y TAMANO (comun a todos)
// ==========================================

interface SeccionGeometriaProps {
  elemento: ElementoTemplate;
  onActualizar: (elemento: ElementoTemplate) => void;
}

function SeccionGeometria({ elemento, onActualizar }: SeccionGeometriaProps) {
  const actualizar = (campo: "x" | "y" | "ancho" | "alto", valor: number) => {
    onActualizar({ ...elemento, [campo]: valor });
  };

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Posicion y tamano
      </h4>
      <div className="grid grid-cols-2 gap-2">
        <CampoNumerico
          etiqueta="X (px)"
          valor={elemento.x}
          min={0}
          onChange={(v) => actualizar("x", v)}
        />
        <CampoNumerico
          etiqueta="Y (px)"
          valor={elemento.y}
          min={0}
          onChange={(v) => actualizar("y", v)}
        />
        <CampoNumerico
          etiqueta="Ancho (px)"
          valor={elemento.ancho}
          min={10}
          onChange={(v) => actualizar("ancho", v)}
        />
        <CampoNumerico
          etiqueta="Alto (px)"
          valor={elemento.alto}
          min={10}
          onChange={(v) => actualizar("alto", v)}
        />
      </div>
    </div>
  );
}

// ==========================================
// PROPIEDADES POR TIPO
// ==========================================

function PropiedadesImagen({
  elemento,
  onActualizar,
}: {
  elemento: ElementoImagen;
  onActualizar: (elemento: ElementoTemplate) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleArchivoSeleccionado = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const archivo = e.target.files?.[0];
      if (!archivo) return;

      const LIMITE_BYTES = 5 * 1024 * 1024;
      if (archivo.size > LIMITE_BYTES) {
        alert("La imagen no puede superar 5 MB");
        return;
      }

      comprimirImagen(archivo)
        .then((srcComprimido) => {
          onActualizar({
            ...elemento,
            propiedades: { ...elemento.propiedades, src: srcComprimido },
          });
        })
        .catch((error: unknown) => {
          if (error instanceof Error) {
            alert(`Error al procesar la imagen: ${error.message}`);
          } else {
            alert("Error desconocido al procesar la imagen");
          }
        });
    },
    [elemento, onActualizar],
  );

  const OPCIONES_AJUSTE: { valor: AjusteImagen; etiqueta: string }[] = [
    { valor: "contain", etiqueta: "Contener" },
    { valor: "cover", etiqueta: "Cubrir" },
    { valor: "fill", etiqueta: "Estirar" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Imagen
      </h4>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Archivo</label>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleArchivoSeleccionado}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded border border-dashed border-gray-300 px-2 py-2 text-xs text-gray-500 hover:border-blue-400 hover:text-blue-500"
        >
          {elemento.propiedades.src ? "Cambiar imagen" : "Seleccionar imagen"}
        </button>
        {elemento.propiedades.src && (
          <img
            src={elemento.propiedades.src}
            alt="Vista previa"
            className="mt-1 h-16 w-full rounded border object-contain"
          />
        )}
      </div>
      <CampoSelect
        etiqueta="Ajuste"
        valor={elemento.propiedades.ajuste}
        opciones={OPCIONES_AJUSTE}
        onChange={(v) =>
          onActualizar({
            ...elemento,
            propiedades: { ...elemento.propiedades, ajuste: v },
          })
        }
      />
    </div>
  );
}

function PropiedadesTexto({
  elemento,
  onActualizar,
}: {
  elemento: ElementoTexto;
  onActualizar: (elemento: ElementoTemplate) => void;
}) {
  const OPCIONES_ALINEACION: { valor: AlineacionTexto; etiqueta: string }[] = [
    { valor: "left", etiqueta: "Izquierda" },
    { valor: "center", etiqueta: "Centro" },
    { valor: "right", etiqueta: "Derecha" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Texto
      </h4>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Contenido</label>
        <textarea
          value={elemento.propiedades.contenido}
          rows={3}
          onChange={(e) =>
            onActualizar({
              ...elemento,
              propiedades: {
                ...elemento.propiedades,
                contenido: e.target.value,
              },
            })
          }
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
        />
      </div>
      <CampoNumerico
        etiqueta="Tamano fuente (px)"
        valor={elemento.propiedades.tamano_fuente}
        min={6}
        max={72}
        onChange={(v) =>
          onActualizar({
            ...elemento,
            propiedades: { ...elemento.propiedades, tamano_fuente: v },
          })
        }
      />
      <CampoSelect
        etiqueta="Alineacion"
        valor={elemento.propiedades.alineacion}
        opciones={OPCIONES_ALINEACION}
        onChange={(v) =>
          onActualizar({
            ...elemento,
            propiedades: { ...elemento.propiedades, alineacion: v },
          })
        }
      />
      <CampoToggle
        etiqueta="Negrita"
        valor={elemento.propiedades.negrita}
        onChange={(v) =>
          onActualizar({
            ...elemento,
            propiedades: { ...elemento.propiedades, negrita: v },
          })
        }
      />
      <CampoToggle
        etiqueta="Cursiva"
        valor={elemento.propiedades.cursiva}
        onChange={(v) =>
          onActualizar({
            ...elemento,
            propiedades: { ...elemento.propiedades, cursiva: v },
          })
        }
      />
    </div>
  );
}

function PropiedadesCampoDinamico({
  elemento,
  onActualizar,
}: {
  elemento: ElementoCampoDinamico;
  onActualizar: (elemento: ElementoTemplate) => void;
}) {
  const OPCIONES_ALINEACION: { valor: AlineacionTexto; etiqueta: string }[] = [
    { valor: "left", etiqueta: "Izquierda" },
    { valor: "center", etiqueta: "Centro" },
    { valor: "right", etiqueta: "Derecha" },
  ];

  const OPCIONES_CAMPO: { valor: CampoDinamico; etiqueta: string }[] =
    CAMPOS_DINAMICOS_DISPONIBLES.map((c) => ({
      valor: c.campo,
      etiqueta: c.etiqueta,
    }));

  const OPCIONES_POSICION_ETIQUETA: {
    valor: PosicionEtiqueta;
    etiqueta: string;
  }[] = [
    { valor: "izq", etiqueta: "Inline izquierda" },
    { valor: "centro", etiqueta: "Inline centro" },
    { valor: "der", etiqueta: "Inline derecha" },
    { valor: "arriba_izq", etiqueta: "Arriba izquierda" },
    { valor: "arriba_centro", etiqueta: "Arriba centro" },
    { valor: "arriba_der", etiqueta: "Arriba derecha" },
    { valor: "abajo_izq", etiqueta: "Abajo izquierda" },
    { valor: "abajo_centro", etiqueta: "Abajo centro" },
    { valor: "abajo_der", etiqueta: "Abajo derecha" },
  ];

  const OPCIONES_FORMATO_FECHA: { valor: FormatoFecha; etiqueta: string }[] = [
    { valor: "corta", etiqueta: "Corta (15/06/2025)" },
    { valor: "larga", etiqueta: "Larga (15 de junio de 2025)" },
    { valor: "completa", etiqueta: "Completa (Domingo, 15 de junio de 2025)" },
  ];

  const OPCIONES_FORMATO_HORA: { valor: FormatoHora; etiqueta: string }[] = [
    { valor: "24h", etiqueta: "24 horas (14:30)" },
    { valor: "12h", etiqueta: "12 horas (2:30 PM)" },
  ];

  const esFechaHora = elemento.propiedades.campo === "{{fecha_hora}}";

  return (
    <div className="flex flex-col gap-3">
      {/* ========== SECCION: CAMPO ========== */}
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Campo dinamico
      </h4>
      <CampoSelect
        etiqueta="Campo"
        valor={elemento.propiedades.campo}
        opciones={OPCIONES_CAMPO}
        onChange={(v) =>
          onActualizar({
            ...elemento,
            propiedades: {
              ...elemento.propiedades,
              campo: v,
              etiqueta:
                CAMPOS_DINAMICOS_DISPONIBLES.find((c) => c.campo === v)
                  ?.etiqueta ?? v,
            },
          })
        }
      />

      {/* ========== SECCION: FORMATO FECHA/HORA ========== */}
      {esFechaHora && (
        <>
          <hr className="border-gray-200" />
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Formato de fecha y hora
          </h4>
          <CampoSelect
            etiqueta="Formato de fecha"
            valor={elemento.propiedades.formato_fecha}
            opciones={OPCIONES_FORMATO_FECHA}
            onChange={(v) =>
              onActualizar({
                ...elemento,
                propiedades: { ...elemento.propiedades, formato_fecha: v },
              })
            }
          />
          <CampoSelect
            etiqueta="Formato de hora"
            valor={elemento.propiedades.formato_hora}
            opciones={OPCIONES_FORMATO_HORA}
            onChange={(v) =>
              onActualizar({
                ...elemento,
                propiedades: { ...elemento.propiedades, formato_hora: v },
              })
            }
          />
        </>
      )}

      {/* ========== SECCION: ESTILO DEL VALOR ========== */}
      <hr className="border-gray-200" />
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Estilo del valor
      </h4>
      <CampoNumerico
        etiqueta="Tamano fuente (px)"
        valor={elemento.propiedades.tamano_fuente}
        min={6}
        max={72}
        onChange={(v) =>
          onActualizar({
            ...elemento,
            propiedades: { ...elemento.propiedades, tamano_fuente: v },
          })
        }
      />
      <CampoSelect
        etiqueta="Alineacion"
        valor={elemento.propiedades.alineacion}
        opciones={OPCIONES_ALINEACION}
        onChange={(v) =>
          onActualizar({
            ...elemento,
            propiedades: { ...elemento.propiedades, alineacion: v },
          })
        }
      />
      <CampoToggle
        etiqueta="Negrita"
        valor={elemento.propiedades.negrita}
        onChange={(v) =>
          onActualizar({
            ...elemento,
            propiedades: { ...elemento.propiedades, negrita: v },
          })
        }
      />
      <CampoToggle
        etiqueta="Cursiva"
        valor={elemento.propiedades.cursiva}
        onChange={(v) =>
          onActualizar({
            ...elemento,
            propiedades: { ...elemento.propiedades, cursiva: v },
          })
        }
      />

      {/* ========== SECCION: ETIQUETA ========== */}
      <hr className="border-gray-200" />
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Etiqueta
      </h4>
      <CampoToggle
        etiqueta="Mostrar etiqueta"
        valor={elemento.propiedades.mostrar_etiqueta}
        onChange={(v) =>
          onActualizar({
            ...elemento,
            propiedades: { ...elemento.propiedades, mostrar_etiqueta: v },
          })
        }
      />

      {elemento.propiedades.mostrar_etiqueta && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Texto de la etiqueta
            </label>
            <input
              type="text"
              value={elemento.propiedades.etiqueta}
              onChange={(e) =>
                onActualizar({
                  ...elemento,
                  propiedades: {
                    ...elemento.propiedades,
                    etiqueta: e.target.value,
                  },
                })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>
          <CampoSelect
            etiqueta="Posicion"
            valor={elemento.propiedades.posicion_etiqueta}
            opciones={OPCIONES_POSICION_ETIQUETA}
            onChange={(v) =>
              onActualizar({
                ...elemento,
                propiedades: {
                  ...elemento.propiedades,
                  posicion_etiqueta: v,
                },
              })
            }
          />
          <CampoNumerico
            etiqueta="Tamano fuente etiqueta (px)"
            valor={elemento.propiedades.etiqueta_tamano_fuente}
            min={6}
            max={48}
            onChange={(v) =>
              onActualizar({
                ...elemento,
                propiedades: {
                  ...elemento.propiedades,
                  etiqueta_tamano_fuente: v,
                },
              })
            }
          />
          <CampoToggle
            etiqueta="Etiqueta negrita"
            valor={elemento.propiedades.etiqueta_negrita}
            onChange={(v) =>
              onActualizar({
                ...elemento,
                propiedades: {
                  ...elemento.propiedades,
                  etiqueta_negrita: v,
                },
              })
            }
          />
          <CampoToggle
            etiqueta="Etiqueta cursiva"
            valor={elemento.propiedades.etiqueta_cursiva}
            onChange={(v) =>
              onActualizar({
                ...elemento,
                propiedades: {
                  ...elemento.propiedades,
                  etiqueta_cursiva: v,
                },
              })
            }
          />
        </>
      )}
    </div>
  );
}

function PropiedadesQR({
  elemento,
  onActualizar,
}: {
  elemento: ElementoQR;
  onActualizar: (elemento: ElementoTemplate) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Codigo QR
      </h4>
      <div className="rounded bg-blue-50 px-3 py-2 text-xs text-blue-700">
        El QR siempre representa el PIN del ticket. No es configurable.
      </div>
      <CampoNumerico
        etiqueta="Tamano del QR (px)"
        valor={elemento.propiedades.tamano}
        min={32}
        max={120}
        onChange={(v) =>
          onActualizar({
            ...elemento,
            propiedades: { ...elemento.propiedades, tamano: v },
          })
        }
      />
    </div>
  );
}

function PropiedadesSeparador({
  elemento,
  onActualizar,
}: {
  elemento: ElementoSeparador;
  onActualizar: (elemento: ElementoTemplate) => void;
}) {
  const OPCIONES_ESTILO: { valor: EstiloSeparador; etiqueta: string }[] = [
    { valor: "solido", etiqueta: "Solido" },
    { valor: "punteado", etiqueta: "Punteado" },
    { valor: "guiones", etiqueta: "Guiones" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Separador
      </h4>
      <CampoSelect
        etiqueta="Estilo"
        valor={elemento.propiedades.estilo}
        opciones={OPCIONES_ESTILO}
        onChange={(v) =>
          onActualizar({
            ...elemento,
            propiedades: { ...elemento.propiedades, estilo: v },
          })
        }
      />
      <CampoNumerico
        etiqueta="Grosor (px)"
        valor={elemento.propiedades.grosor}
        min={1}
        max={5}
        onChange={(v) =>
          onActualizar({
            ...elemento,
            propiedades: { ...elemento.propiedades, grosor: v },
          })
        }
      />
    </div>
  );
}

// ==========================================
// PANEL PRINCIPAL
// ==========================================

function PanelPropiedades({
  elemento,
  onActualizar,
  onEliminar,
  onCopiar,
  onDuplicar,
}: PanelPropiedadesProps) {
  if (!elemento) {
    return (
      <div className="w-56 shrink-0 border-l border-gray-200 bg-gray-50 p-3">
        <h3 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Propiedades
        </h3>
        <p className="text-xs text-gray-400">
          Selecciona un elemento del canvas para editar sus propiedades.
        </p>
      </div>
    );
  }

  const renderizarPropiedadesTipo = () => {
    switch (elemento.tipo) {
      case "IMAGEN":
        return (
          <PropiedadesImagen elemento={elemento} onActualizar={onActualizar} />
        );
      case "TEXTO":
        return (
          <PropiedadesTexto elemento={elemento} onActualizar={onActualizar} />
        );
      case "CAMPO_DINAMICO":
        return (
          <PropiedadesCampoDinamico
            elemento={elemento}
            onActualizar={onActualizar}
          />
        );
      case "QR":
        return (
          <PropiedadesQR elemento={elemento} onActualizar={onActualizar} />
        );
      case "SEPARADOR":
        return (
          <PropiedadesSeparador
            elemento={elemento}
            onActualizar={onActualizar}
          />
        );
    }
  };

  return (
    <div className="flex w-56 shrink-0 flex-col border-l border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Propiedades
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onCopiar(elemento)}
            className="rounded p-1 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
            title="Copiar elemento (Ctrl+C)"
          >
            <Copy size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDuplicar(elemento)}
            className="rounded p-1 text-gray-400 hover:bg-green-50 hover:text-green-600"
            title="Duplicar elemento"
          >
            <CopyPlus size={14} />
          </button>
          <button
            type="button"
            onClick={() => onEliminar(elemento.id)}
            className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
            title="Eliminar elemento"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto p-3">
        <SeccionGeometria elemento={elemento} onActualizar={onActualizar} />
        <hr className="border-gray-200" />
        {renderizarPropiedadesTipo()}
      </div>
    </div>
  );
}

export default PanelPropiedades;
