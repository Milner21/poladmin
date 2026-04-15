import {
  useState,
  useMemo,
  useCallback,
  type FC,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@components";
import { useCargarPadron } from "./hooks/useCargarPadron";
import { usePartidos } from "@pages/private/partidos/hooks/usePartidos";
import { padronService } from "@services/padron.service";
import RoutesConfig from "@routes/RoutesConfig";
import type {
  TipoPadron,
  ResultadoCargaPadron,
  ResumenDepartamento,
} from "@dto/padron.types";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  MapPin,
  Users,
} from "lucide-react";

const COLUMNAS_INTERNO = [
  "CI",
  "NOMBRE",
  "APELLIDO",
  "FECHA_NACIMIENTO",
  "DEPARTAMENTO",
  "DISTRITO",
  "SECCIONAL",
  "LOCAL_VOTACION",
  "MESA",
  "ORDEN",
];

const COLUMNAS_GENERAL = [
  "CI",
  "NOMBRE",
  "APELLIDO",
  "FECHA_NACIMIENTO",
  "DEPARTAMENTO",
  "DISTRITO",
  "LOCAL_VOTACION",
  "MESA",
  "ORDEN",
];

const CargarPadron: FC = () => {
  const navigate = useNavigate();

  const [tipoPadron, setTipoPadron] = useState<TipoPadron>("INTERNO");
  const [partidoId, setPartidoId] = useState<string>("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [resultado, setResultado] = useState<ResultadoCargaPadron | null>(null);
  const [departamentosAbiertos, setDepartamentosAbiertos] = useState<
    Set<string>
  >(new Set());

  const { data: partidos } = usePartidos();
  const cargarMutation = useCargarPadron();

  const { data: resumen, isLoading: loadingResumen } = useQuery({
    queryKey: ["padron-resumen", tipoPadron],
    queryFn: () => padronService.obtenerResumen(tipoPadron),
  });

  const { data: stats } = useQuery({
    queryKey: ["padron-stats"],
    queryFn: () => padronService.obtenerStats(),
  });

  const columnasRequeridas = useMemo(
    () => (tipoPadron === "INTERNO" ? COLUMNAS_INTERNO : COLUMNAS_GENERAL),
    [tipoPadron],
  );

  const totalRegistros = useMemo(() => {
    if (!resumen) return 0;
    return resumen.departamentos.reduce((acc, dep) => acc + dep.total, 0);
  }, [resumen]);

  const toggleDepartamento = useCallback((departamento: string) => {
    setDepartamentosAbiertos((prev) => {
      const next = new Set(prev);
      if (next.has(departamento)) {
        next.delete(departamento);
      } else {
        next.add(departamento);
      }
      return next;
    });
  }, []);

  const handleVerDistrito = useCallback(
    (departamento: string, distrito: string) => {
      navigate(RoutesConfig.padronDetalle(tipoPadron, departamento, distrito));
    },
    [navigate, tipoPadron],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validarArchivo(file)) {
        setArchivo(file);
        setResultado(null);
      }
    }
  }, []);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validarArchivo(file)) {
        setArchivo(file);
        setResultado(null);
      }
    }
  }, []);

  const validarArchivo = (file: File): boolean => {
    const extensionesValidas = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!extensionesValidas.includes(file.type)) {
      alert("Solo se permiten archivos Excel (.xlsx, .xls)");
      return false;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert("El archivo no puede superar los 50MB");
      return false;
    }
    return true;
  };

  const handleSubir = useCallback(() => {
    if (!archivo) return;
    if (tipoPadron === "INTERNO" && !partidoId) {
      alert("Debe seleccionar un partido para cargar el padron interno");
      return;
    }

    cargarMutation.mutate(
      {
        archivo,
        tipo: tipoPadron,
        partido_id: tipoPadron === "INTERNO" ? partidoId : undefined,
      },
      {
        onSuccess: (data) => {
          setResultado(data);
          setArchivo(null);
        },
      },
    );
  }, [archivo, tipoPadron, partidoId, cargarMutation]);

  const handleLimpiar = useCallback(() => {
    setArchivo(null);
    setResultado(null);
  }, []);

  const handleTipoChange = useCallback((tipo: TipoPadron) => {
    setTipoPadron(tipo);
    setArchivo(null);
    setResultado(null);
    setPartidoId("");
    setDepartamentosAbiertos(new Set());
  }, []);

  return (
    <div className="py-4 px-6">
      <PageHeader
        title="Cargar Padron Electoral"
        subtitle="Subi archivos Excel para cargar el padron interno (afiliados) o general (TSJE)"
        showDivider
      />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Stats globales */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-bg-content border border-border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Padron Interno</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {stats.padron_interno.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-bg-content border border-border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Padron General</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {stats.padron_general.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selector de tipo */}
        <div className="bg-bg-content border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Selecciona el tipo de padron
          </h3>
          <div className="flex gap-4">
            <label className="flex-1 cursor-pointer">
              <div
                className={`border-2 rounded-lg p-4 transition-all ${
                  tipoPadron === "INTERNO"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="tipoPadron"
                  value="INTERNO"
                  checked={tipoPadron === "INTERNO"}
                  onChange={() => handleTipoChange("INTERNO")}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      tipoPadron === "INTERNO"
                        ? "border-primary"
                        : "border-border"
                    }`}
                  >
                    {tipoPadron === "INTERNO" && (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      Padron Interno
                    </p>
                    <p className="text-sm text-text-secondary">
                      Afiliados al partido
                    </p>
                  </div>
                </div>
              </div>
            </label>

            <label className="flex-1 cursor-pointer">
              <div
                className={`border-2 rounded-lg p-4 transition-all ${
                  tipoPadron === "GENERAL"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="tipoPadron"
                  value="GENERAL"
                  checked={tipoPadron === "GENERAL"}
                  onChange={() => handleTipoChange("GENERAL")}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      tipoPadron === "GENERAL"
                        ? "border-primary"
                        : "border-border"
                    }`}
                  >
                    {tipoPadron === "GENERAL" && (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      Padron General
                    </p>
                    <p className="text-sm text-text-secondary">
                      TSJE - Votantes generales
                    </p>
                  </div>
                </div>
              </div>
            </label>
          </div>

          {/* Selector de partido para padron interno */}
          {tipoPadron === "INTERNO" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-text-primary mb-1">
                Partido <span className="text-danger">*</span>
              </label>
              <select
                value={partidoId}
                onChange={(e) => setPartidoId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-bg-content text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Seleccionar partido</option>
                {partidos?.map((partido) => (
                  <option key={partido.id} value={partido.id}>
                    {partido.sigla} - {partido.nombre}
                  </option>
                ))}
              </select>
              <p className="text-xs text-text-tertiary mt-1">
                El padron interno se asociara a este partido
              </p>
            </div>
          )}
        </div>

        {/* Columnas requeridas */}
        <div className="bg-bg-content border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Columnas requeridas en el Excel
          </h3>
          <div className="flex flex-wrap gap-2">
            {columnasRequeridas.map((col) => (
              <span
                key={col}
                className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium"
              >
                {col}
              </span>
            ))}
          </div>
        </div>

        {/* Drag and Drop */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`bg-bg-content border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <Upload
            className={`w-16 h-16 mx-auto mb-4 ${
              isDragging ? "text-primary" : "text-text-secondary"
            }`}
          />

          {archivo ? (
            <div className="space-y-2">
              <p className="text-lg font-medium text-text-primary">
                {archivo.name}
              </p>
              <p className="text-sm text-text-secondary">
                {(archivo.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <>
              <p className="text-lg font-medium text-text-primary mb-2">
                Arrasta tu archivo Excel aca
              </p>
              <p className="text-sm text-text-secondary mb-4">
                o hace clic para seleccionar
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
              >
                Seleccionar archivo
              </label>
            </>
          )}
        </div>

        {/* Botones */}
        {archivo && (
          <div className="flex gap-4">
            <button
              onClick={handleSubir}
              disabled={cargarMutation.isPending}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {cargarMutation.isPending ? "Subiendo..." : "Subir archivo"}
            </button>
            <button
              onClick={handleLimpiar}
              disabled={cargarMutation.isPending}
              className="px-6 py-3 border border-border text-text-primary rounded-lg hover:bg-bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Limpiar
            </button>
          </div>
        )}

        {/* Resultado de carga */}
        {resultado && (
          <div className="bg-bg-content border border-border rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Resultado de la carga
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-bg-base rounded-lg">
                <p className="text-2xl font-bold text-text-primary">
                  {resultado.total_filas}
                </p>
                <p className="text-sm text-text-secondary">Total filas</p>
              </div>
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <p className="text-2xl font-bold text-success">
                  {resultado.insertados}
                </p>
                <p className="text-sm text-text-secondary">Insertados</p>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <p className="text-2xl font-bold text-accent">
                  {resultado.omitidos}
                </p>
                <p className="text-sm text-text-secondary">Ya existian</p>
              </div>
              <div className="text-center p-4 bg-error/10 rounded-lg">
                <p className="text-2xl font-bold text-error">
                  {resultado.errores_count}
                </p>
                <p className="text-sm text-text-secondary">Errores</p>
              </div>
            </div>

            {resultado.errores.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold text-text-primary flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-error" />
                  Detalle de errores (primeros 50)
                </h4>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {resultado.errores.map((err, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm p-2 bg-error/5 rounded"
                    >
                      <XCircle className="w-4 h-4 text-error shrink-0" />
                      <span className="text-text-secondary">
                        Fila {err.fila}: {err.motivo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Acordeon de departamentos y distritos */}
        <div className="bg-bg-content border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold text-text-primary">
                Padron {tipoPadron === "INTERNO" ? "Interno" : "General"} por
                distrito
              </h3>
            </div>
            {resumen && (
              <span className="text-sm text-text-secondary">
                {totalRegistros.toLocaleString()} registros totales
              </span>
            )}
          </div>

          {loadingResumen && (
            <div className="text-center py-12 text-text-secondary">
              Cargando...
            </div>
          )}

          {!loadingResumen && resumen && resumen.departamentos.length === 0 && (
            <div className="text-center py-12 text-text-secondary">
              No hay registros cargados todavia para este tipo de padron
            </div>
          )}

          {!loadingResumen && resumen && resumen.departamentos.length > 0 && (
            <div className="divide-y divide-border">
              {resumen.departamentos.map((dep: ResumenDepartamento) => {
                const estaAbierto = departamentosAbiertos.has(dep.departamento);

                return (
                  <div key={dep.departamento}>
                    {/* Fila del departamento */}
                    <button
                      onClick={() => toggleDepartamento(dep.departamento)}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-bg-hover transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        {estaAbierto ? (
                          <ChevronDown className="w-5 h-5 text-primary" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-text-secondary" />
                        )}
                        <span className="font-semibold text-text-primary">
                          {dep.departamento}
                        </span>
                        <span className="text-sm text-text-secondary">
                          ({dep.distritos.length} distritos)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-text-secondary" />
                        <span className="text-sm font-medium text-text-primary">
                          {dep.total.toLocaleString()}
                        </span>
                      </div>
                    </button>

                    {/* Tabla de distritos */}
                    {estaAbierto && (
                      <div className="bg-bg-base border-t border-border">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="px-8 py-2 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                Distrito
                              </th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                Registros
                              </th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                Accion
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {dep.distritos.map((dis) => (
                              <tr
                                key={dis.distrito}
                                className="hover:bg-bg-hover transition-colors cursor-pointer"
                                onDoubleClick={() =>
                                  handleVerDistrito(
                                    dep.departamento,
                                    dis.distrito,
                                  )
                                }
                              >
                                <td className="px-8 py-3 text-sm text-text-primary">
                                  {dis.distrito}
                                </td>
                                <td className="px-4 py-3 text-sm text-text-secondary text-right">
                                  {dis.total.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    onClick={() =>
                                      handleVerDistrito(
                                        dep.departamento,
                                        dis.distrito,
                                      )
                                    }
                                    className="text-xs text-primary hover:underline font-medium"
                                  >
                                    Ver detalle
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CargarPadron;
