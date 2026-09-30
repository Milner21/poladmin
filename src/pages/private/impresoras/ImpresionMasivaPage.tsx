// src/pages/private/impresoras/ImpresionMasivaPage.tsx

import { useState, useEffect, useCallback, useMemo, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@components";
import { useCampanaSeleccionada } from "@hooks/useCampanaSeleccionada";
import { usePermisos } from "@hooks/usePermisos";
import { useMiImpresora } from "./hooks/useMiImpresora";
import { useCandidatosSuperiores } from "@pages/private/usuarios/hooks/useCandidatosSuperiores";
import { useUsuarios } from "@pages/private/usuarios/hooks/useUsuarios";
import { impresorasService } from "@services/impresoras.service";
import type {
  ImprimirLoteFiltros,
  LotePreviewResponse,
} from "@dto/impresora.types";
import RoutesConfig from "@routes/RoutesConfig";
import toast from "react-hot-toast";
import {
  Printer,
  Search,
  Loader2,
  Users,
  Building2,
  MapPin,
  ChevronDown,
  UserCheck,
  ArrowLeft,
  AlertTriangle,
  X,
} from "lucide-react";

interface UsuarioOpcion {
  id: string;
  nombre: string;
  apellido: string;
  documento: string;
  perfil: string;
}

const ImpresionMasivaPage: FC = () => {
  const navigate = useNavigate();
  const { campanaSeleccionada, campanaActual } = useCampanaSeleccionada();
  const { tienePermiso, esRoot } = usePermisos();
  const { data: miImpresora } = useMiImpresora();
  const { data: candidatosData } = useCandidatosSuperiores(
    campanaSeleccionada,
    99,
  );
  const { data: todosLosUsuarios } = useUsuarios(campanaSeleccionada);

  const puedeImprimirMasivo = esRoot || tienePermiso("imprimir_lote_tickets");

  const [filtros, setFiltros] = useState<ImprimirLoteFiltros>({
    candidato_id: "",
    registrado_por_id: "",
    barrio: "",
    local_votacion: "",
    solo_pendientes: true,
    modo_eleccion: undefined,
  });

  const [previewData, setPreviewData] = useState<LotePreviewResponse | null>(
    null,
  );
  const [cargandoPreview, setCargandoPreview] = useState(false);
  const [imprimiendo, setImprimiendo] = useState(false);

  // Dropdown Candidato
  const [searchCandidato, setSearchCandidato] = useState("");
  const [dropdownCandidatoAbierto, setDropdownCandidatoAbierto] =
    useState(false);
  const [candidatoSeleccionado, setCandidatoSeleccionado] =
    useState<UsuarioOpcion | null>(null);

  // Dropdown Registrador
  const [searchRegistrador, setSearchRegistrador] = useState("");
  const [dropdownRegistradorAbierto, setDropdownRegistradorAbierto] =
    useState(false);
  const [registradorSeleccionado, setRegistradorSeleccionado] =
    useState<UsuarioOpcion | null>(null);

  const impresoraConectada = miImpresora && miImpresora.estado === "CONECTADA";

  // Requisito 3: Impedir consulta/impresión si no se seleccionó Candidato O Registrador
  const tieneSeleccionObligatoria = useMemo(() => {
    return Boolean(filtros.candidato_id || filtros.registrado_por_id);
  }, [filtros.candidato_id, filtros.registrado_por_id]);

  useEffect(() => {
    const modo = campanaActual?.configuracion?.modo_eleccion;
    if (modo) {
      setFiltros((prev) => ({
        ...prev,
        modo_eleccion: modo as "INTERNAS" | "GENERALES",
      }));
    }
  }, [campanaActual]);

  // Requisito 4: Buscador por CI o Nombre para Candidatos
  const candidatosFiltrados = useMemo(() => {
    if (!candidatosData) return [];
    return candidatosData
      .map((c) => {
        const documentoStr =
          "documento" in c &&
          typeof (c as { documento?: unknown }).documento === "string"
            ? (c as { documento: string }).documento
            : "";

        return {
          id: c.id,
          nombre: c.nombre,
          apellido: c.apellido,
          documento: documentoStr,
          perfil: c.nivel?.nombre ?? "Candidato",
        };
      })
      .filter((u) => {
        if (!searchCandidato.trim()) return true;
        const busqueda = searchCandidato.toLowerCase();
        const nombreCompleto = `${u.nombre} ${u.apellido}`.toLowerCase();
        return (
          nombreCompleto.includes(busqueda) ||
          (u.documento ? u.documento.includes(busqueda) : false)
        );
      });
  }, [candidatosData, searchCandidato]);

  // Requisito 4: Buscador por CI o Nombre para Registradores
  const registradoresFiltrados = useMemo(() => {
    if (!todosLosUsuarios) return [];
    return todosLosUsuarios
      .filter((u) => u.estado)
      .map((u) => ({
        id: u.id,
        nombre: u.nombre,
        apellido: u.apellido,
        documento: u.documento,
        perfil: u.perfil.nombre,
      }))
      .filter((u) => {
        if (!searchRegistrador.trim()) return true;
        const busqueda = searchRegistrador.toLowerCase();
        const nombreCompleto = `${u.nombre} ${u.apellido}`.toLowerCase();
        return (
          nombreCompleto.includes(busqueda) || u.documento.includes(busqueda)
        );
      });
  }, [todosLosUsuarios, searchRegistrador]);

  const cargarPreview = useCallback(
    async (filtrosActuales: ImprimirLoteFiltros) => {
      if (!filtrosActuales.candidato_id && !filtrosActuales.registrado_por_id) {
        setPreviewData(null);
        return;
      }

      setCargandoPreview(true);
      try {
        const payload: ImprimirLoteFiltros = {
          ...filtrosActuales,
          candidato_id: filtrosActuales.candidato_id || undefined,
          registrado_por_id: filtrosActuales.registrado_por_id || undefined,
          barrio: filtrosActuales.barrio?.trim() || undefined,
          local_votacion: filtrosActuales.local_votacion?.trim() || undefined,
        };
        const res = await impresorasService.previewLote(payload);
        setPreviewData(res);
      } catch {
        toast.error("Error al obtener vista previa de simpatizantes");
      } finally {
        setCargandoPreview(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (tieneSeleccionObligatoria) {
      cargarPreview(filtros);
    } else {
      setPreviewData(null);
    }
  }, [filtros, tieneSeleccionObligatoria, cargarPreview]);

  const handleFiltroChange = (
    campo: keyof ImprimirLoteFiltros,
    valor: string | boolean | undefined,
  ) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSeleccionarCandidato = (u: UsuarioOpcion | null) => {
    if (!u) {
      setCandidatoSeleccionado(null);
      handleFiltroChange("candidato_id", "");
    } else {
      setCandidatoSeleccionado(u);
      handleFiltroChange("candidato_id", u.id);
    }
    setDropdownCandidatoAbierto(false);
    setSearchCandidato("");
  };

  const handleSeleccionarRegistrador = (u: UsuarioOpcion | null) => {
    if (!u) {
      setRegistradorSeleccionado(null);
      handleFiltroChange("registrado_por_id", "");
    } else {
      setRegistradorSeleccionado(u);
      handleFiltroChange("registrado_por_id", u.id);
    }
    setDropdownRegistradorAbierto(false);
    setSearchRegistrador("");
  };

  const handleBuscarManual = () => {
    if (!tieneSeleccionObligatoria) {
      toast.error(
        "Debés seleccionar al menos un Candidato Político o un Registrador",
      );
      return;
    }
    cargarPreview(filtros);
  };

  const handleEjecutarImpresion = async () => {
    if (!impresoraConectada) {
      toast.error("No tenés una impresora asignada y conectada");
      return;
    }

    if (!tieneSeleccionObligatoria) {
      toast.error(
        "Debés seleccionar al menos un Candidato Político o un Registrador",
      );
      return;
    }

    if (!previewData || previewData.total === 0) {
      toast.error("No hay tickets para imprimir con los filtros seleccionados");
      return;
    }

    const nombreImpresora = miImpresora?.nombre || "asignada";
    const destinatario = candidatoSeleccionado
      ? `candidato ${candidatoSeleccionado.nombre} ${candidatoSeleccionado.apellido}`
      : `registrador ${registradorSeleccionado?.nombre} ${registradorSeleccionado?.apellido}`;

    const confirmar = window.confirm(
      `¿Confirmás la impresión masiva de ${previewData.total} tickets para el ${destinatario} en la impresora "${nombreImpresora}"?\n\nLos tickets se enviarán y cortarán uno a uno de forma secuencial.`,
    );
    if (!confirmar) return;

    setImprimiendo(true);
    try {
      const payload: ImprimirLoteFiltros = {
        ...filtros,
        candidato_id: filtros.candidato_id || undefined,
        registrado_por_id: filtros.registrado_por_id || undefined,
        barrio: filtros.barrio?.trim() || undefined,
        local_votacion: filtros.local_votacion?.trim() || undefined,
      };
      const res = await impresorasService.imprimirLote(payload);
      toast.success(res.mensaje);
      cargarPreview(filtros);
    } catch {
      toast.error("Error al despachar el lote de impresión");
    } finally {
      setImprimiendo(false);
    }
  };

  if (!puedeImprimirMasivo) {
    return (
      <div className="p-6">
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-6 text-center">
          <p className="text-warning font-medium">
            No tenés permisos para realizar impresiones masivas de tickets
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Impresión Masiva de Tickets"
        subtitle="Generá y cortá secuencialmente tickets por candidato o por registrador"
      />

      <div className="mb-6">
        <button
          onClick={() => navigate(RoutesConfig.impresorasLista)}
          className="btn btn-outline flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Volver a impresoras
        </button>
      </div>

      {/* Estado Impresora */}
      <div
        className={`p-4 rounded-xl border mb-6 flex items-center justify-between text-sm ${
          impresoraConectada
            ? "bg-success/10 border-success/30 text-success"
            : "bg-warning/10 border-warning/30 text-warning"
        }`}
      >
        <div className="flex items-center gap-3">
          <Printer size={20} />
          <div>
            <p className="font-bold">
              Impresora:{" "}
              {miImpresora ? miImpresora.nombre : "Sin impresora asignada"}
            </p>
            <p className="text-xs opacity-80">
              {impresoraConectada
                ? "Conectada y lista para recibir trabajos en cola"
                : "Asigná y conectá una impresora térmica para habilitar el botón de impresión"}
            </p>
          </div>
        </div>
        <span className="font-semibold text-xs uppercase px-3 py-1 rounded-lg bg-bg-content/60">
          {impresoraConectada ? "Conectada" : "Desconectada"}
        </span>
      </div>

      {/* Panel de Filtros */}
      <div className="bg-bg-content border border-border rounded-xl p-6 shadow-sm mb-6 space-y-4">
        <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2">
          Filtros Obligatorios de Selección
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Selector Candidato Político Buscable por Nombre o CI */}
          <div className="relative">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-text-primary mb-1">
              <Users size={14} /> Candidato Político
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setDropdownCandidatoAbierto(!dropdownCandidatoAbierto);
                  setDropdownRegistradorAbierto(false);
                }}
                className="w-full px-3 py-2.5 text-sm text-left border border-border rounded-lg bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between"
              >
                <span className="truncate font-medium">
                  {candidatoSeleccionado
                    ? `${candidatoSeleccionado.nombre} ${candidatoSeleccionado.apellido} (${candidatoSeleccionado.perfil})`
                    : "-- Seleccionar Candidato Político --"}
                </span>
                <div className="flex items-center gap-1">
                  {candidatoSeleccionado && (
                    <X
                      size={14}
                      className="text-text-tertiary hover:text-danger cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSeleccionarCandidato(null);
                      }}
                    />
                  )}
                  <ChevronDown size={16} className="text-text-tertiary" />
                </div>
              </button>

              {dropdownCandidatoAbierto && (
                <div className="absolute z-50 w-full mt-1 bg-bg-content border border-border rounded-lg shadow-xl max-h-60 overflow-hidden">
                  <div className="p-2 border-b border-border">
                    <input
                      type="text"
                      value={searchCandidato}
                      onChange={(e) => setSearchCandidato(e.target.value)}
                      placeholder="Buscar por nombre, apellido o CI..."
                      className="w-full px-3 py-2 text-xs border border-border rounded-md bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-44 overflow-y-auto divide-y divide-border/50">
                    <button
                      type="button"
                      onClick={() => handleSeleccionarCandidato(null)}
                      className={`w-full px-3 py-2 text-left text-xs hover:bg-bg-base transition-colors ${
                        !candidatoSeleccionado
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-text-secondary"
                      }`}
                    >
                      Ninguno (sin filtro de candidato)
                    </button>
                    {candidatosFiltrados.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSeleccionarCandidato(c)}
                        className={`w-full px-3 py-2 text-left text-xs hover:bg-bg-base transition-colors ${
                          candidatoSeleccionado?.id === c.id
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-text-primary"
                        }`}
                      >
                        <p className="font-semibold">
                          {c.nombre} {c.apellido}
                        </p>
                        <p className="text-[11px] text-text-tertiary">
                          {c.perfil} {c.documento ? `• CI: ${c.documento}` : ""}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selector Registrado Por Buscable por Nombre o CI */}
          <div className="relative">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-text-primary mb-1">
              <UserCheck size={14} /> Registrado Por (Operador/Administrador)
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setDropdownRegistradorAbierto(!dropdownRegistradorAbierto);
                  setDropdownCandidatoAbierto(false);
                }}
                className="w-full px-3 py-2.5 text-sm text-left border border-border rounded-lg bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between"
              >
                <span className="truncate font-medium">
                  {registradorSeleccionado
                    ? `${registradorSeleccionado.nombre} ${registradorSeleccionado.apellido} (${registradorSeleccionado.perfil})`
                    : "-- Seleccionar Registrador/Operador --"}
                </span>
                <div className="flex items-center gap-1">
                  {registradorSeleccionado && (
                    <X
                      size={14}
                      className="text-text-tertiary hover:text-danger cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSeleccionarRegistrador(null);
                      }}
                    />
                  )}
                  <ChevronDown size={16} className="text-text-tertiary" />
                </div>
              </button>

              {dropdownRegistradorAbierto && (
                <div className="absolute z-50 w-full mt-1 bg-bg-content border border-border rounded-lg shadow-xl max-h-60 overflow-hidden">
                  <div className="p-2 border-b border-border">
                    <input
                      type="text"
                      value={searchRegistrador}
                      onChange={(e) => setSearchRegistrador(e.target.value)}
                      placeholder="Buscar por nombre, apellido o CI..."
                      className="w-full px-3 py-2 text-xs border border-border rounded-md bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-44 overflow-y-auto divide-y divide-border/50">
                    <button
                      type="button"
                      onClick={() => handleSeleccionarRegistrador(null)}
                      className={`w-full px-3 py-2 text-left text-xs hover:bg-bg-base transition-colors ${
                        !registradorSeleccionado
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-text-secondary"
                      }`}
                    >
                      Ninguno (sin filtro de registrador)
                    </button>
                    {registradoresFiltrados.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSeleccionarRegistrador(u)}
                        className={`w-full px-3 py-2 text-left text-xs hover:bg-bg-base transition-colors ${
                          registradorSeleccionado?.id === u.id
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-text-primary"
                        }`}
                      >
                        <p className="font-semibold">
                          {u.nombre} {u.apellido}
                        </p>
                        <p className="text-[11px] text-text-tertiary">
                          {u.perfil} • CI: {u.documento}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filtros Opcionales */}
        <div className="pt-3 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center gap-1 text-xs font-semibold text-text-primary mb-1">
              <MapPin size={14} /> Barrio (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. San Pablo"
              value={filtros.barrio || ""}
              onChange={(e) => handleFiltroChange("barrio", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="flex items-center gap-1 text-xs font-semibold text-text-primary mb-1">
              <Building2 size={14} /> Local de Votación (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Escuela Nro 1"
              value={filtros.local_votacion || ""}
              onChange={(e) =>
                handleFiltroChange("local_votacion", e.target.value)
              }
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="flex items-center gap-1 text-xs font-semibold text-text-primary mb-1">
              Etapa / Modo Electoral
            </label>
            <select
              value={filtros.modo_eleccion || "GENERALES"}
              onChange={(e) =>
                handleFiltroChange(
                  "modo_eleccion",
                  e.target.value as "INTERNAS" | "GENERALES",
                )
              }
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-bg-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="INTERNAS">Internas</option>
              <option value="GENERALES">Generales</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filtros.solo_pendientes}
              onChange={(e) =>
                handleFiltroChange("solo_pendientes", e.target.checked)
              }
              className="w-4 h-4 accent-primary cursor-pointer rounded"
            />
            <span className="text-sm font-medium text-text-primary">
              Imprimir solo tickets pendientes (no impresos previamente)
            </span>
          </label>

          <button
            type="button"
            onClick={handleBuscarManual}
            disabled={!tieneSeleccionObligatoria || cargandoPreview}
            className="btn btn-primary flex items-center gap-2 text-sm"
          >
            {cargandoPreview ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Search size={16} />
            )}
            Consultar Simpatizantes
          </button>
        </div>
      </div>

      {/* Alerta si no se seleccionó candidato ni registrador */}
      {!tieneSeleccionObligatoria && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-5 mb-6 flex items-center gap-3">
          <AlertTriangle className="text-warning shrink-0" size={24} />
          <div>
            <p className="font-bold text-warning text-sm">
              Selección de candidato u operador requerida
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              Para evitar impresiones accidentales de toda la campaña, debés
              seleccionar un
              <strong> Candidato Político</strong> o un{" "}
              <strong>Registrador (Operador)</strong> en los filtros superiores.
            </p>
          </div>
        </div>
      )}

      {/* Tabla de Vista Previa */}
      <div className="bg-bg-content border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-text-primary m-0">
              Vista Previa de Simpatizantes para el Lote
            </h3>
            <p className="text-xs text-text-tertiary mt-0.5 m-0">
              Ordenados alfabéticamente por Apellido y Nombre (A-Z)
            </p>
          </div>

          {previewData && (
            <span className="text-sm font-bold text-primary px-3 py-1 rounded-lg bg-primary/10 border border-primary/20">
              {previewData.total} tickets listos para imprimir
            </span>
          )}
        </div>

        {cargandoPreview ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm text-text-tertiary font-medium">
              Consultando simpatizantes para el lote de impresión...
            </p>
          </div>
        ) : previewData && previewData.total > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-bg-base text-text-tertiary uppercase border-b border-border font-semibold">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">CI</th>
                  <th className="p-3">Nombre y Apellido</th>
                  <th className="p-3">Barrio</th>
                  <th className="p-3">Local de Votación</th>
                  <th className="p-3">Mesa / Orden</th>
                  <th className="p-3">Estado Ticket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {previewData.simpatizantes.map((s, idx) => (
                  <tr
                    key={s.id}
                    className="hover:bg-bg-base/50 transition-colors"
                  >
                    <td className="p-3 text-text-tertiary font-mono">
                      {idx + 1}
                    </td>
                    <td className="p-3 font-mono font-bold text-text-primary">
                      {s.documento}
                    </td>
                    <td className="p-3 font-medium text-text-primary">
                      {s.nombre} {s.apellido}
                    </td>
                    <td className="p-3 text-text-secondary">
                      {s.barrio || "-"}
                    </td>
                    <td className="p-3 text-text-secondary">
                      {s.local_votacion || "-"}
                    </td>
                    <td className="p-3 text-text-secondary">
                      Mesa: {s.mesa || "-"} | Ord: {s.orden || "-"}
                    </td>
                    <td className="p-3">
                      {s.ticket_impreso ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning/10 text-warning font-semibold border border-warning/20">
                          Reimpresión
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-semibold border border-success/20">
                          Pendiente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-text-tertiary text-sm">
            {tieneSeleccionObligatoria
              ? "No se encontraron simpatizantes con los filtros aplicados."
              : "Seleccioná un Candidato o Registrador para visualizar la lista."}
          </div>
        )}

        {/* Footer Acción de Impresión */}
        <div className="p-5 border-t border-border bg-bg-base/40 flex items-center justify-between flex-wrap gap-4">
          <div className="text-xs text-text-tertiary">
            {previewData && previewData.total > 0
              ? `Se enviarán ${previewData.total} trabajos secuenciales a la ticketera.`
              : "Completá los filtros obligatorios para habilitar el despacho."}
          </div>

          <button
            type="button"
            onClick={handleEjecutarImpresion}
            disabled={
              imprimiendo ||
              !impresoraConectada ||
              !tieneSeleccionObligatoria ||
              !previewData ||
              previewData.total === 0
            }
            className="flex items-center gap-2 px-6 py-3 bg-success hover:bg-success/90 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {imprimiendo ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Despachando tickets...
              </>
            ) : (
              <>
                <Printer size={18} />
                Imprimir {previewData?.total ?? 0} Tickets
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImpresionMasivaPage;
