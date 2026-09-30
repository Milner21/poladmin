// src/pages/private/simpatizantes/operativa-locales/OperativaLocalesPage.tsx

import { CTable, PageHeader } from "@components";
import type { ColumnDef } from "@components/CTable";
import type {
  FiltrosReporte,
  LocalOperativaData,
  OperativaLocalesResponse,
  VotanteOperativaLocal,
} from "@dto/reportes.types";
import { useCampanaSeleccionada } from "@hooks/useCampanaSeleccionada";
import { useCandidatosSuperiores } from "@pages/private/usuarios/hooks/useCandidatosSuperiores";
import { useUsuarios } from "@pages/private/usuarios/hooks/useUsuarios";
import { reportesService } from "@services/reportes.service";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  ChevronDown,
  Clock,
  Phone,
  Search,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState, type FC } from "react";

interface UsuarioOpcion {
  id: string;
  nombre: string;
  apellido: string;
  documento: string;
  perfil: string;
}

export const OperativaLocalesPage: FC = () => {
  const { campanaSeleccionada, campanaActual } = useCampanaSeleccionada();
  const { data: candidatosData } = useCandidatosSuperiores(
    campanaSeleccionada,
    99,
  );
  const { data: todosLosUsuarios } = useUsuarios(campanaSeleccionada);

  // Pasos del Wizard: 1 = Filtros, 2 = Lista de Locales, 3 = Detalle de Local/Mesa
  const [paso, setPaso] = useState<1 | 2 | 3>(1);

  // Filtros
  const [filtros, setFiltros] = useState<FiltrosReporte>({
    campana_id: campanaSeleccionada,
    candidato_id: undefined,
    registrado_por_id: undefined,
  });

  // Local seleccionado para Paso 3
  const [localSeleccionado, setLocalSeleccionado] =
    useState<LocalOperativaData | null>(null);
  const [mesaFiltro, setMesaFiltro] = useState<string>("");

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

  const tieneFiltroObligatorio = Boolean(
    filtros.candidato_id || filtros.registrado_por_id,
  );

  // Query para obtener la operativa de locales
  const {
    data: dataOperativa,
    isLoading: loadingOperativa,
    refetch,
  } = useQuery<OperativaLocalesResponse>({
    queryKey: [
      "operativa-locales",
      campanaSeleccionada,
      filtros.candidato_id,
      filtros.registrado_por_id,
    ],
    queryFn: () => reportesService.getOperativaLocales(filtros),
    enabled: !!campanaSeleccionada && tieneFiltroObligatorio,
    staleTime: 1000 * 60 * 2,
  });

  // Filtros de búsqueda para Candidato
  const candidatosFiltrados = useMemo(() => {
    if (!candidatosData) return [];
    return candidatosData
      .map((c) => {
        const doc =
          "documento" in c &&
          typeof (c as { documento?: unknown }).documento === "string"
            ? (c as { documento: string }).documento
            : "";
        return {
          id: c.id,
          nombre: c.nombre,
          apellido: c.apellido,
          documento: doc,
          perfil: c.nivel?.nombre ?? "Candidato",
        };
      })
      .filter((u) => {
        if (!searchCandidato.trim()) return true;
        const busqueda = searchCandidato.toLowerCase();
        return (
          `${u.nombre} ${u.apellido}`.toLowerCase().includes(busqueda) ||
          (u.documento ? u.documento.includes(busqueda) : false)
        );
      });
  }, [candidatosData, searchCandidato]);

  // Filtros de búsqueda para Registrador
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
        return (
          `${u.nombre} ${u.apellido}`.toLowerCase().includes(busqueda) ||
          u.documento.includes(busqueda)
        );
      });
  }, [todosLosUsuarios, searchRegistrador]);

  // Handlers
  const handleSeleccionarCandidato = (u: UsuarioOpcion | null) => {
    setCandidatoSeleccionado(u);
    setFiltros((prev) => ({
      ...prev,
      campana_id: campanaSeleccionada,
      candidato_id: u?.id ?? undefined,
    }));
    setDropdownCandidatoAbierto(false);
    setSearchCandidato("");
  };

  const handleSeleccionarRegistrador = (u: UsuarioOpcion | null) => {
    setRegistradorSeleccionado(u);
    setFiltros((prev) => ({
      ...prev,
      campana_id: campanaSeleccionada,
      registrado_por_id: u?.id ?? undefined,
    }));
    setDropdownRegistradorAbierto(false);
    setSearchRegistrador("");
  };

  const handleConsultar = async () => {
    if (!tieneFiltroObligatorio) return;
    const res = await refetch();
    if (res.data) {
      setPaso(2);
    }
  };

  const handleVerLocal = (localData: LocalOperativaData) => {
    setLocalSeleccionado(localData);
    setMesaFiltro("");
    setPaso(3);
  };

  // Simpatizantes filtrados por mesa en el Paso 3
  const votantesFiltradosMesa = useMemo(() => {
    if (!localSeleccionado) return [];
    if (!mesaFiltro) return localSeleccionado.simpatizantes;
    return localSeleccionado.simpatizantes.filter(
      (s) => s.mesa_votacion === mesaFiltro,
    );
  }, [localSeleccionado, mesaFiltro]);

  // Columnas para la tabla del Paso 3
  const columnasVotantes: ColumnDef<VotanteOperativaLocal>[] = [
    {
      key: "orden_votacion",
      title: "Orden",
      render: (s: VotanteOperativaLocal) => (
        <span className="font-mono font-bold text-primary">
          {s.orden_votacion}
        </span>
      ),
    },
    {
      key: "mesa_votacion",
      title: "Mesa",
      render: (s: VotanteOperativaLocal) => (
        <span className="font-mono font-semibold text-text-primary">
          {s.mesa_votacion}
        </span>
      ),
    },
    {
      key: "nombre",
      title: "Elector",
      render: (s: VotanteOperativaLocal) => (
        <div>
          <p className="font-bold text-text-primary m-0">
            {s.nombre} {s.apellido}
          </p>
          <p className="text-xs text-text-tertiary font-mono m-0">
            CI: {s.documento}
          </p>
        </div>
      ),
    },
    {
      key: "contacto",
      title: "Ubicación / Contacto",
      render: (s: VotanteOperativaLocal) => (
        <div className="text-xs space-y-0.5">
          <p className="text-text-secondary m-0">{s.barrio || "-"}</p>
          {s.telefono && (
            <p className="text-text-tertiary flex items-center gap-1 m-0">
              <Phone size={11} /> {s.telefono}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "voto",
      title: "Estado Voto",
      render: (s: VotanteOperativaLocal) => (
        <div>
          {s.voto ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/10 border border-success/30 text-success text-xs font-bold">
              <CheckCircle size={13} /> Votó
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-warning/10 border border-warning/30 text-warning text-xs font-bold">
              <Clock size={13} /> Pendiente
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="py-4 px-6 space-y-6">
      <PageHeader
        title={
          campanaActual
            ? `Operativa por Locales — ${campanaActual.nombre}`
            : "Operativa por Locales de Votación"
        }
        subtitle="Control de participación y votantes en tiempo real agrupados por escuela y mesa"
        showDivider
      />

      {/* Indicador de Pasos / Wizard */}
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <button
          type="button"
          onClick={() => setPaso(1)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            paso === 1
              ? "bg-primary text-white"
              : "bg-bg-base text-text-secondary hover:text-text-primary"
          }`}
        >
          1. Selección de Candidato
        </button>

        <span className="text-text-tertiary">/</span>

        <button
          type="button"
          onClick={() => dataOperativa && setPaso(2)}
          disabled={!dataOperativa}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            paso === 2
              ? "bg-primary text-white"
              : dataOperativa
                ? "bg-bg-base text-text-secondary hover:text-text-primary"
                : "bg-bg-base text-text-tertiary opacity-50 cursor-not-allowed"
          }`}
        >
          2. Locales de Votación ({dataOperativa?.total_locales ?? 0})
        </button>

        {paso === 3 && (
          <>
            <span className="text-text-tertiary">/</span>
            <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white">
              3. {localSeleccionado?.local}
            </span>
          </>
        )}
      </div>

      {/* PASO 1: SELECCIÓN DE CANDIDATO O REGISTRADOR */}
      {paso === 1 && (
        <div className="max-w-3xl bg-bg-content border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-bold text-text-primary m-0">
              Paso 1: Seleccioná el referente político u operador
            </h3>
            <p className="text-xs text-text-tertiary mt-1 m-0">
              Elegí un Candidato o Registrador para visualizar las escuelas y
              mesas donde tiene votantes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Buscador Candidato */}
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
                      : "-- Seleccionar Candidato --"}
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
                        placeholder="Buscar por nombre o CI..."
                        className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-bg-base text-text-primary focus:outline-none"
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
                        Ninguno
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
                          <p className="font-semibold m-0">
                            {c.nombre} {c.apellido}
                          </p>
                          <p className="text-[11px] text-text-tertiary m-0">
                            {c.perfil}{" "}
                            {c.documento ? `• CI: ${c.documento}` : ""}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Buscador Registrador */}
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
                      : "-- Seleccionar Registrador --"}
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
                        placeholder="Buscar por nombre o CI..."
                        className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-bg-base text-text-primary focus:outline-none"
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
                        Ninguno
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
                          <p className="font-semibold m-0">
                            {u.nombre} {u.apellido}
                          </p>
                          <p className="text-[11px] text-text-tertiary m-0">
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

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleConsultar}
              disabled={!tieneFiltroObligatorio || loadingOperativa}
              className="btn btn-primary flex items-center gap-2 px-6 py-2.5 text-sm font-bold disabled:opacity-50"
            >
              {loadingOperativa ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search size={16} />
              )}
              Consultar Locales y Mesas
            </button>
          </div>
        </div>
      )}

      {/* PASO 2: LISTA DE LOCALES DE VOTACIÓN EN CARDS */}
      {paso === 2 && dataOperativa && (
        <div className="space-y-6">
          {/* Header Resumen General */}
          <div className="bg-bg-content border border-border rounded-xl p-6 shadow-sm flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider m-0">
                Resumen Operativo ({dataOperativa.modo_eleccion})
              </p>
              <h3 className="text-xl font-black text-text-primary mt-1 m-0">
                {candidatoSeleccionado
                  ? `Candidato: ${candidatoSeleccionado.nombre}`
                  : `Registrador: ${registradorSeleccionado?.nombre}`}
              </h3>
            </div>

            <div className="flex gap-4">
              <div className="text-center px-4 py-2 bg-bg-base border border-border rounded-xl">
                <p className="text-xs text-text-tertiary font-medium m-0">
                  Total Votantes
                </p>
                <p className="text-xl font-bold text-text-primary m-0">
                  {dataOperativa.total_simpatizantes}
                </p>
              </div>
              <div className="text-center px-4 py-2 bg-success/10 border border-success/30 rounded-xl">
                <p className="text-xs text-success font-medium m-0">
                  Ya Votaron
                </p>
                <p className="text-xl font-bold text-success m-0">
                  {dataOperativa.total_votaron}
                </p>
              </div>
              <div className="text-center px-4 py-2 bg-warning/10 border border-warning/30 rounded-xl">
                <p className="text-xs text-warning font-medium m-0">
                  Pendientes
                </p>
                <p className="text-xl font-bold text-warning m-0">
                  {dataOperativa.total_pendientes}
                </p>
              </div>
            </div>
          </div>

          {/* Cards de Locales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataOperativa.locales.map((loc) => (
              <div
                key={loc.local}
                onClick={() => handleVerLocal(loc)}
                className="bg-bg-content border border-border hover:border-primary rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-primary">
                      <Building2 size={20} />
                      <h4 className="font-bold text-base text-text-primary m-0 line-clamp-1">
                        {loc.local}
                      </h4>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full shrink-0">
                      {loc.total_mesas} mesa{loc.total_mesas !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <p className="text-xs text-text-tertiary m-0">
                    {loc.total} simpatizantes asignados a este local
                  </p>
                </div>

                {/* Barra de progreso */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-success">{loc.votaron} Votaron</span>
                    <span className="text-text-primary">
                      {loc.porcentaje_participacion}%
                    </span>
                    <span className="text-warning">
                      {loc.pendientes} Pendientes
                    </span>
                  </div>
                  <div className="w-full bg-bg-base rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-success h-full transition-all duration-500"
                      style={{ width: `${loc.porcentaje_participacion}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-2 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors text-center"
                >
                  Ver Mesas y Votantes →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PASO 3: DETALLE DE LOCAL, MESAS Y LISTADO DE VOTANTES */}
      {paso === 3 && localSeleccionado && (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => setPaso(2)}
            className="btn btn-outline flex items-center gap-2 text-xs font-bold"
          >
            <ArrowLeft size={16} />
            Volver a lista de locales
          </button>

          {/* Header del Local Seleccionado */}
          <div className="bg-bg-content border border-border rounded-xl p-6 shadow-sm flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <Building2 size={22} />
                <h3 className="text-xl font-bold text-text-primary m-0">
                  {localSeleccionado.local}
                </h3>
              </div>
              <p className="text-xs text-text-tertiary mt-1 m-0">
                Resumen de votación para este local
              </p>
            </div>

            <div className="flex gap-4">
              <div className="text-center px-4 py-2 bg-bg-base border border-border rounded-xl">
                <p className="text-xs text-text-tertiary font-medium m-0">
                  Total Votantes
                </p>
                <p className="text-xl font-bold text-text-primary m-0">
                  {localSeleccionado.total}
                </p>
              </div>
              <div className="text-center px-4 py-2 bg-success/10 border border-success/30 rounded-xl">
                <p className="text-xs text-success font-medium m-0">Votaron</p>
                <p className="text-xl font-bold text-success m-0">
                  {localSeleccionado.votaron}
                </p>
              </div>
              <div className="text-center px-4 py-2 bg-warning/10 border border-warning/30 rounded-xl">
                <p className="text-xs text-warning font-medium m-0">
                  Pendientes
                </p>
                <p className="text-xl font-bold text-warning m-0">
                  {localSeleccionado.pendientes}
                </p>
              </div>
            </div>
          </div>

          {/* Selector de Mesas */}
          <div className="bg-bg-content border border-border rounded-xl p-4 flex items-center gap-3 overflow-x-auto">
            <span className="text-xs font-bold uppercase text-text-tertiary shrink-0">
              Filtrar por Mesa:
            </span>
            <button
              type="button"
              onClick={() => setMesaFiltro("")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                !mesaFiltro
                  ? "bg-primary text-white"
                  : "bg-bg-base text-text-secondary hover:bg-bg-hover"
              }`}
            >
              Todas las mesas ({localSeleccionado.total})
            </button>

            {localSeleccionado.mesas.map((m) => (
              <button
                key={m.mesa}
                type="button"
                onClick={() => setMesaFiltro(m.mesa)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  mesaFiltro === m.mesa
                    ? "bg-primary text-white"
                    : "bg-bg-base text-text-secondary hover:bg-bg-hover"
                }`}
              >
                Mesa {m.mesa}
                <span className="text-[10px] px-1.5 py-0.2 bg-bg-content/50 rounded-full">
                  {m.votaron}/{m.total}
                </span>
              </button>
            ))}
          </div>

          {/* Tabla de Votantes del Local / Mesa */}
          <div className="bg-bg-content border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h4 className="text-sm font-bold text-text-primary m-0">
                Listado de Votantes{" "}
                {mesaFiltro ? `— Mesa ${mesaFiltro}` : "— Todas las mesas"}
              </h4>
              <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10">
                {votantesFiltradosMesa.length} votantes encontrados
              </span>
            </div>

            <CTable<VotanteOperativaLocal>
              data={votantesFiltradosMesa}
              columns={columnasVotantes}
              rowKey="id"
              pagination={true}
              defaultPageSize={20}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OperativaLocalesPage;
