// src/pages/private/templates/TemplateEditorPage.tsx

import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Save, Eye, EyeOff, Loader2 } from "lucide-react";
import type {
  ElementoTemplate,
  AnchoPapel,
  ModoEleccionTemplate,
} from "@dto/template.types";
import { useTemplatePorModo, useGuardarTemplate } from "./hooks/useTemplates";
import ToolbarElementos from "./components/ToolbarElementos";
import CanvasTicket from "./components/CanvasTicket";
import PanelPropiedades from "./components/PanelPropiedades";
import RoutesConfig from "@routes/RoutesConfig";
import { clonarElemento } from "./utils/clonarElemento";

interface ParamsEditor {
  campanaId: string;
  modo: string;
  [key: string]: string;
}

function TemplateEditorPage() {
  const { campanaId, modo } = useParams<ParamsEditor>();
  const navigate = useNavigate();

  const modoEleccion = modo?.toUpperCase() as ModoEleccionTemplate | undefined;

  // ==========================================
  // HOOKS - todos antes de cualquier return
  // ==========================================

  const { data: templateExistente, isLoading } = useTemplatePorModo(
    modoEleccion ?? null,
  );
  const { mutate: guardarTemplate, isPending: guardando } =
    useGuardarTemplate();

  const [elementos, setElementos] = useState<ElementoTemplate[]>([]);
  const [anchoPapel, setAnchoPapel] = useState<AnchoPapel>(58);
  const [elementoSeleccionadoId, setElementoSeleccionadoId] = useState<
    string | null
  >(null);
  const [preview, setPreview] = useState<boolean>(false);
  const [inicializado, setInicializado] = useState<boolean>(false);
  const [portapapeles, setPortapapeles] = useState<ElementoTemplate | null>(
    null,
  );

  // Cargar datos del template existente al montar
  useEffect(() => {
    if (inicializado) return;
    if (isLoading) return;

    if (templateExistente) {
      setElementos(templateExistente.elementos);
      setAnchoPapel(templateExistente.ancho_papel as AnchoPapel);
      setInicializado(true);
      return;
    }

    setInicializado(true);
  }, [templateExistente, isLoading, inicializado]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleAgregarElemento = useCallback((elemento: ElementoTemplate) => {
    setElementos((prev) => [...prev, elemento]);
    setElementoSeleccionadoId(elemento.id);
  }, []);

  const handleSeleccionarElemento = useCallback((id: string | null) => {
    setElementoSeleccionadoId(id);
  }, []);

  const handleMoverElemento = useCallback(
    (id: string, x: number, y: number) => {
      setElementos((prev) =>
        prev.map((el) => (el.id === id ? { ...el, x, y } : el)),
      );
    },
    [],
  );

  const handleActualizarElemento = useCallback(
    (elementoActualizado: ElementoTemplate) => {
      setElementos((prev) =>
        prev.map((el) =>
          el.id === elementoActualizado.id ? elementoActualizado : el,
        ),
      );
    },
    [],
  );

  const handleEliminarElemento = useCallback(
    (id: string) => {
      setElementos((prev) => prev.filter((el) => el.id !== id));
      if (elementoSeleccionadoId === id) {
        setElementoSeleccionadoId(null);
      }
    },
    [elementoSeleccionadoId],
  );

  const calcularOrdenSiguiente = useCallback((): number => {
    if (elementos.length === 0) return 0;
    return Math.max(...elementos.map((el) => el.orden)) + 1;
  }, [elementos]);

  const handleCopiarElemento = useCallback((elemento: ElementoTemplate) => {
    setPortapapeles(elemento);
  }, []);

  const handleDuplicarElemento = useCallback(
    (elemento: ElementoTemplate) => {
      const clon = clonarElemento(elemento, calcularOrdenSiguiente());
      setElementos((prev) => [...prev, clon]);
      setElementoSeleccionadoId(clon.id);
    },
    [calcularOrdenSiguiente],
  );

  const handlePegar = useCallback(() => {
    if (!portapapeles) return;
    const clon = clonarElemento(portapapeles, calcularOrdenSiguiente());
    setElementos((prev) => [...prev, clon]);
    setElementoSeleccionadoId(clon.id);
  }, [portapapeles, calcularOrdenSiguiente]);

  const handleGuardar = useCallback(() => {
    if (!modoEleccion || !campanaId) return;

    guardarTemplate({
      modo: modoEleccion,
      dto: {
        modo_eleccion: modoEleccion,
        ancho_papel: anchoPapel,
        elementos,
      },
    });
  }, [modoEleccion, campanaId, guardarTemplate, anchoPapel, elementos]);

  // ==========================================
  // ELEMENTO SELECCIONADO ACTUAL
  // ==========================================

  const elementoSeleccionado =
    elementos.find((el) => el.id === elementoSeleccionadoId) ?? null;

  // Atajos de teclado: Ctrl+C, Ctrl+V, Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const enInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT";

      if (enInput) return;

      if (e.ctrlKey && e.key === "c") {
        e.preventDefault();
        if (elementoSeleccionado) {
          handleCopiarElemento(elementoSeleccionado);
        }
        return;
      }

      if (e.ctrlKey && e.key === "v") {
        e.preventDefault();
        handlePegar();
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (elementoSeleccionadoId) {
          handleEliminarElemento(elementoSeleccionadoId);
        }
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    elementoSeleccionado,
    elementoSeleccionadoId,
    handleCopiarElemento,
    handlePegar,
    handleEliminarElemento,
  ]);

  const handleCambiarAncho = useCallback((nuevoAncho: AnchoPapel) => {
    setAnchoPapel(nuevoAncho);
    setElementoSeleccionadoId(null);
  }, []);

  const handleVolver = useCallback(() => {
    navigate(RoutesConfig.templateLista);
  }, [navigate]);

  // ==========================================
  // RETURNS CONDICIONALES
  // ==========================================

  if (!modoEleccion || !campanaId) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Parametros invalidos
      </div>
    );
  }

  if (isLoading && !inicializado) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-gray-500">
        <Loader2 size={18} className="animate-spin" />
        Cargando template...
      </div>
    );
  }

  // ==========================================
  // RETURN PRINCIPAL
  // ==========================================

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      {/* BARRA SUPERIOR */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleVolver}
            className="flex items-center gap-1 rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft size={16} />
            Volver
          </button>
          <div className="h-4 w-px bg-gray-300" />
          <h1 className="text-sm font-semibold text-gray-800">
            Template - <span className="text-blue-600">{modoEleccion}</span>
          </h1>
          {templateExistente && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
              Guardado
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de ancho de papel */}
          <div className="flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1">
            <span className="text-xs text-gray-500">Papel:</span>
            {([58, 80] as AnchoPapel[]).map((ancho) => (
              <button
                key={ancho}
                type="button"
                onClick={() => handleCambiarAncho(ancho)}
                className={`rounded px-2 py-0.5 text-xs font-medium transition ${
                  anchoPapel === ancho
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {ancho}mm
              </button>
            ))}
          </div>

          {/* Toggle preview */}
          <button
            type="button"
            onClick={() => {
              setPreview((prev) => !prev);
              setElementoSeleccionadoId(null);
            }}
            className={`flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium transition ${
              preview
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "border border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {preview ? (
              <>
                <EyeOff size={14} />
                Editar
              </>
            ) : (
              <>
                <Eye size={14} />
                Preview
              </>
            )}
          </button>

          {/* Boton guardar */}
          <button
            type="button"
            onClick={handleGuardar}
            disabled={guardando}
            className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {guardando ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      {/* CUERPO PRINCIPAL */}
      <div className="flex flex-1 overflow-hidden">
        {/* Toolbar izquierda - oculta en preview */}
        {!preview && <ToolbarElementos />}

        {/* Canvas central */}
        <CanvasTicket
          elementos={elementos}
          anchoPapel={anchoPapel}
          elementoSeleccionadoId={elementoSeleccionadoId}
          preview={preview}
          onAgregarElemento={handleAgregarElemento}
          onSeleccionarElemento={handleSeleccionarElemento}
          onMoverElemento={handleMoverElemento}
        />

        {/* Panel de propiedades derecha - oculto en preview */}
        {!preview && (
          <PanelPropiedades
            elemento={elementoSeleccionado}
            onActualizar={handleActualizarElemento}
            onEliminar={handleEliminarElemento}
            onCopiar={handleCopiarElemento}
            onDuplicar={handleDuplicarElemento}
          />
        )}
      </div>
    </div>
  );
}

export default TemplateEditorPage;
