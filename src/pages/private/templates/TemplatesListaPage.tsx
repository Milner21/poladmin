// src/pages/private/templates/TemplatesListaPage.tsx

import { useNavigate } from 'react-router';
import { ArrowLeft, FileText, Pencil, Plus, Loader2 } from 'lucide-react';
import { useTemplates } from './hooks/useTemplates';
import RoutesConfig from '@routes/RoutesConfig';
import type { ModoEleccionTemplate, TemplateTicket } from '@dto/template.types';
import { useAuth } from '@hooks/useAuth';

interface ModoCard {
  modo: ModoEleccionTemplate;
  etiqueta: string;
  descripcion: string;
}

const MODOS: ModoCard[] = [
  {
    modo: 'INTERNAS',
    etiqueta: 'Internas',
    descripcion: 'Template para elecciones internas del partido',
  },
  {
    modo: 'GENERALES',
    etiqueta: 'Generales',
    descripcion: 'Template para elecciones generales municipales',
  },
];

function buscarTemplatePorModo(
  templates: TemplateTicket[],
  modo: ModoEleccionTemplate,
): TemplateTicket | undefined {
  return templates.find((t) => t.modo_eleccion === modo);
}

function TemplatesListaPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  // ==========================================
  // HOOKS
  // ==========================================

  const { data: templates, isLoading } = useTemplates();

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleEditar = (modo: ModoEleccionTemplate) => {
    const campanaId =
      usuario?.perfil.nombre === 'ROOT'
        ? localStorage.getItem('campana_seleccionada_root')
        : usuario?.campana_id;

    if (!campanaId) return;
    navigate(`/admin/templates/${campanaId}/${modo.toLowerCase()}`);
  };

  const handleVolver = () => {
    navigate(RoutesConfig.configuracion);
  };

  // ==========================================
  // RETURNS CONDICIONALES
  // ==========================================

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-gray-500">
        <Loader2 size={18} className="animate-spin" />
        Cargando templates...
      </div>
    );
  }

  // ==========================================
  // RETURN PRINCIPAL
  // ==========================================

  const listaTemplates = templates ?? [];

  return (
    <div className="mx-auto max-w-3xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleVolver}
          className="flex items-center gap-1 rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
        <div className="h-4 w-px bg-gray-300" />
        <div>
          <h1 className="text-lg font-bold text-gray-800">
            Disenador de Tickets
          </h1>
          <p className="text-sm text-gray-500">
            Selecciona el modo de eleccion para disenar el template del ticket
          </p>
        </div>
      </div>

      {/* Cards de modos */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MODOS.map((modoCard) => {
          const template = buscarTemplatePorModo(listaTemplates, modoCard.modo);
          const existe = template !== undefined;

          return (
            <div
              key={modoCard.modo}
              className="flex flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              {/* Icono y titulo */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`rounded-lg p-2 ${
                      existe ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    <FileText
                      size={20}
                      className={existe ? 'text-green-600' : 'text-gray-400'}
                    />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800">
                      {modoCard.etiqueta}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {modoCard.descripcion}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    existe
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {existe ? 'Configurado' : 'Sin configurar'}
                </span>
              </div>

              {/* Detalles del template */}
              {existe && template && (
                <div className="mb-4 flex flex-col gap-1 rounded bg-gray-50 px-3 py-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Ancho de papel:</span>
                    <span className="font-medium">
                      {template.ancho_papel}mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Elementos:</span>
                    <span className="font-medium">
                      {template.elementos.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ultima actualizacion:</span>
                    <span className="font-medium">
                      {new Date(template.actualizado_en).toLocaleDateString(
                        'es-PY',
                      )}
                    </span>
                  </div>
                </div>
              )}

              {!existe && (
                <div className="mb-4 flex flex-1 items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-xs text-gray-400">
                  No se ha creado ningun template para este modo
                </div>
              )}

              {/* Boton de accion */}
              <button
                type="button"
                onClick={() => handleEditar(modoCard.modo)}
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  existe
                    ? 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {existe ? (
                  <>
                    <Pencil size={14} />
                    Editar template
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    Crear template
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TemplatesListaPage;