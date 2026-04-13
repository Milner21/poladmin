import { type FC, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { useMapaCalor } from "@pages/private/mapa/hooks/useMapaCalor";
import type { PuntoMapa } from "@dto/reportes.types";

interface Props {
  campanaId: string | null;
}

const CENTRO_DEFAULT: [number, number] = [-25.2637, -57.5759];

const getColor = (intencion: string): string => {
  switch (intencion) {
    case "SEGURO": return "#10b981";
    case "PROBABLE": return "#3b82f6";
    case "INDECISO": return "#f59e0b";
    case "CONTRARIO": return "#ef4444";
    default: return "#6b7280";
  }
};

export const MapaResumen: FC<Props> = ({ campanaId }) => {
  const { data: mapaData, isLoading } = useMapaCalor({
    campana_id: campanaId ?? undefined,
  });

  const centro = useMemo((): [number, number] => {
    if (!mapaData?.puntos || mapaData.puntos.length === 0) return CENTRO_DEFAULT;
    const sumLat = mapaData.puntos.reduce((sum: number, p: PuntoMapa) => sum + p.latitud, 0);
    const sumLng = mapaData.puntos.reduce((sum: number, p: PuntoMapa) => sum + p.longitud, 0);
    return [sumLat / mapaData.puntos.length, sumLng / mapaData.puntos.length];
  }, [mapaData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!mapaData?.puntos || mapaData.puntos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-tertiary text-sm">
        No hay simpatizantes con GPS registrado
      </div>
    );
  }

  return (
    <div style={{ height: "400px" }}>
      <MapContainer
        center={centro}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mapaData.puntos.map((punto: PuntoMapa) => (
          <CircleMarker
            key={punto.id}
            center={[punto.latitud, punto.longitud]}
            radius={7}
            fillColor={getColor(punto.intencion_voto)}
            color="#fff"
            weight={2}
            opacity={1}
            fillOpacity={0.8}
          >
            <Popup>
              <div className="p-1">
                <p className="font-bold text-sm m-0">
                  {punto.nombre} {punto.apellido}
                </p>
                <p className="text-xs text-gray-500 m-0">
                  {punto.barrio ?? "Sin barrio"}
                </p>
                <span
                  className="text-xs px-2 py-0.5 rounded-full text-white mt-1 inline-block"
                  style={{ backgroundColor: getColor(punto.intencion_voto) }}
                >
                  {punto.intencion_voto}
                </span>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};