import { useState, useMemo, type FC } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import { PageHeader } from "@components";
import { useCampanaSeleccionada } from "@hooks/useCampanaSeleccionada";
import { useMapaCalor } from "./hooks/useMapaCalor";
import { MapPin, Users, Navigation, TrendingUp } from "lucide-react";
import type { PuntoMapa } from "@dto/reportes.types";

// Componente auxiliar para centrar el mapa
const RecenterMap: FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
};

const CENTRO_DEFAULT: [number, number] = [-25.2637, -57.5759];

const MapaCalor: FC = () => {
  const { campanaSeleccionada, campanaActual } = useCampanaSeleccionada();
  const [filtroIntencion, setFiltroIntencion] = useState<string>("TODOS");

  const { data: mapaData, isLoading } = useMapaCalor({
    campana_id: campanaSeleccionada,
  });

  // Calcular centro del mapa basado en puntos
  const centro = useMemo((): [number, number] => {
    if (!mapaData?.puntos || mapaData.puntos.length === 0)
      return CENTRO_DEFAULT;

    const sumLat = mapaData.puntos.reduce(
      (sum: number, p: PuntoMapa) => sum + p.latitud,
      0,
    );
    const sumLng = mapaData.puntos.reduce(
      (sum: number, p: PuntoMapa) => sum + p.longitud,
      0,
    );

    return [sumLat / mapaData.puntos.length, sumLng / mapaData.puntos.length];
  }, [mapaData]);

  // Filtrar puntos según intención de voto
  const puntosFiltrados = useMemo(() => {
    if (!mapaData?.puntos) return [];
    if (filtroIntencion === "TODOS") return mapaData.puntos;
    return mapaData.puntos.filter((p) => p.intencion_voto === filtroIntencion);
  }, [mapaData, filtroIntencion]);

  // Función para obtener color según intención de voto
  const getColor = (intencion: string): string => {
    switch (intencion) {
      case "SEGURO":
        return "#10b981"; // verde
      case "PROBABLE":
        return "#3b82f6"; // azul
      case "INDECISO":
        return "#f59e0b"; // amarillo
      case "CONTRARIO":
        return "#ef4444"; // rojo
      default:
        return "#6b7280"; // gris
    }
  };

  return (
    <div className="py-4 px-6">
      <PageHeader
        title={
          campanaActual
            ? `Mapa de Calor — ${campanaActual.nombre}`
            : "Mapa de Calor"
        }
        subtitle="Visualización geográfica de simpatizantes"
        showDivider
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-xs font-medium">
                Total Simpatizantes
              </p>
              <p className="text-2xl font-bold text-text-primary mt-1">
                {isLoading ? "..." : mapaData?.estadisticas.total || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="text-primary" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-xs font-medium">Con GPS</p>
              <p className="text-2xl font-bold text-success mt-1">
                {isLoading ? "..." : mapaData?.estadisticas.con_gps || 0}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                {mapaData?.estadisticas.porcentaje_con_gps}%
              </p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
              <Navigation className="text-success" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-xs font-medium">Sin GPS</p>
              <p className="text-2xl font-bold text-warning mt-1">
                {isLoading ? "..." : mapaData?.estadisticas.sin_gps || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
              <MapPin className="text-warning" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-xs font-medium">
                Barrios Cubiertos
              </p>
              <p className="text-2xl font-bold text-info mt-1">
                {isLoading ? "..." : mapaData?.densidad_por_barrio.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-info/10 rounded-full flex items-center justify-center">
              <TrendingUp className="text-info" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-bg-content border border-border rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <p className="text-sm font-medium text-text-primary mr-2">
            Filtrar por intención:
          </p>
          {(
            ["TODOS", "SEGURO", "PROBABLE", "INDECISO", "CONTRARIO"] as const
          ).map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltroIntencion(tipo)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                ${
                  filtroIntencion === tipo
                    ? "bg-primary text-white"
                    : "bg-bg-base text-text-secondary hover:bg-bg-hover"
                }
              `}
            >
              {tipo}
            </button>
          ))}
          <span className="ml-auto text-sm text-text-tertiary">
            Mostrando: {puntosFiltrados.length} puntos
          </span>
        </div>
      </div>

      {/* Mapa */}
      <div
        className="bg-bg-content border border-border rounded-xl overflow-hidden"
        style={{ height: "600px" }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <MapContainer
            center={centro}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap center={centro} />

            {puntosFiltrados.map((punto: PuntoMapa) => (
              <CircleMarker
                key={punto.id}
                center={[punto.latitud, punto.longitud]}
                radius={8}
                fillColor={getColor(punto.intencion_voto)}
                color="#fff"
                weight={2}
                opacity={1}
                fillOpacity={0.8}
              >
                <Popup>
                  <div className="p-2">
                    <p className="font-bold text-sm mb-1">
                      {punto.nombre} {punto.apellido}
                    </p>
                    <p className="text-xs text-gray-600 mb-1">
                      📍 {punto.barrio || "Sin barrio"}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className="px-2 py-0.5 rounded-full text-white"
                        style={{
                          backgroundColor: getColor(punto.intencion_voto),
                        }}
                      >
                        {punto.intencion_voto}
                      </span>
                      {punto.es_afiliado && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          Afiliado
                        </span>
                      )}
                      {punto.necesita_transporte && (
                        <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                          🚗 Transporte
                        </span>
                      )}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Leyenda */}
      <div className="bg-bg-content border border-border rounded-xl p-4 mt-6">
        <p className="text-sm font-medium text-text-primary mb-3">Leyenda:</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#10b981]"></div>
            <span className="text-xs text-text-secondary">Voto Seguro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#3b82f6]"></div>
            <span className="text-xs text-text-secondary">Voto Probable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#f59e0b]"></div>
            <span className="text-xs text-text-secondary">Indeciso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#ef4444]"></div>
            <span className="text-xs text-text-secondary">Contrario</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapaCalor;
