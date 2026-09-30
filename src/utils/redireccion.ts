// src/utils/redireccion.ts

import RoutesConfig from "@routes/RoutesConfig";
import type { Usuario } from "@dto/auth.types";

/**
 * Evalúa los permisos del usuario y devuelve la primera ruta disponible.
 */
export function resolverRutaPostLogin(usuario: Usuario): string {
  const esRoot = usuario.perfil?.nombre === "ROOT";
  if (esRoot) return RoutesConfig.dashboard;

  const permisos = new Set([
    ...(usuario.perfil?.permisos?.map((pp) => pp.permiso.nombre) ?? []),
    ...(usuario.permisos_personalizados?.map((pp) => pp.permiso.nombre) ?? []),
  ]);

  const tiene = (nombre: string): boolean => permisos.has(nombre);

  // Orden de prioridad según permisos
  if (tiene("ver_dashboard")) return RoutesConfig.dashboard;
  if (tiene("consultar_padron")) return RoutesConfig.padronConsultar;
  if (tiene("ver_simpatizante") || tiene("registrar_simpatizante_para_terceros"))
    return RoutesConfig.simpatizantesLista;
  if (tiene("ver_reportes")) return RoutesConfig.reportesImprimir;
  if (tiene("ver_reportes_impresion")) return RoutesConfig.impresorasReportes;
  if (tiene("activar_ticket") || tiene("gestionar_cupos_activador"))
    return RoutesConfig.activadorPanel;
  if (tiene("verificar_asistencia")) return RoutesConfig.verificadorPanel;
  if (tiene("registrar_solidaridad")) return RoutesConfig.solidaridadPanel;
  if (tiene("gestionar_puestos")) return RoutesConfig.puestosLista;
  if (tiene("ver_evento")) return RoutesConfig.eventos;
  if (tiene("ver_solicitud")) return RoutesConfig.solicitudes;
  if (tiene("ver_transporte")) return RoutesConfig.transportes;
  if (tiene("ver_mapa")) return RoutesConfig.mapa;
  if (tiene("ver_impresora")) return RoutesConfig.impresorasLista;
  if (tiene("ver_campana")) return RoutesConfig.campanas;
  if (tiene("ver_usuario")) return RoutesConfig.usuarios;
  if (tiene("ver_perfil")) return RoutesConfig.perfiles;
  if (tiene("ver_permiso")) return RoutesConfig.permisos;
  if (tiene("ver_nivel")) return RoutesConfig.niveles;
  if (tiene("ver_partido")) return RoutesConfig.partidos;

  // Fallback si tiene algún permiso
  if (permisos.size > 0) return RoutesConfig.padronConsultar;

  // Si no tiene ningún permiso de vista
  return RoutesConfig.dashboard;
}