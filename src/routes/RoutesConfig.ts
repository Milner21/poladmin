//src/routes/RoutesConfig.ts
export const basePaths = {
  admin: "/admin",
};

const RoutesConfig = {
  // Rutas principales
  home: "/",
  login: "/login",

  // Dashboard
  dashboard: `${basePaths.admin}/dashboard`,

  // Partidos
  partidos: `${basePaths.admin}/partidos`,

  // Niveles
  niveles: `${basePaths.admin}/niveles`,

  // Usuarios
  usuarios: `${basePaths.admin}/usuarios`,
  usuariosCrear: `${basePaths.admin}/usuarios/crear`,
  usuariosEditar: (id: string) => `${basePaths.admin}/usuarios/editar/${id}`,

  // Perfiles
  perfiles: `${basePaths.admin}/perfiles`,
  perfilesCrear: `${basePaths.admin}/perfiles/crear`,
  perfilesEditar: (id: string) => `${basePaths.admin}/perfiles/editar/${id}`,

  // Permisos
  permisos: `${basePaths.admin}/permisos`,

  // Eventos
  eventos: `${basePaths.admin}/eventos`,

  // Padron
  padronCargar: `${basePaths.admin}/padron/cargar`,
  padronDetalle: (tipo: string, departamento: string, distrito: string) =>
    `${basePaths.admin}/padron/detalle/${tipo}/${encodeURIComponent(departamento)}/${encodeURIComponent(distrito)}`,
  padronConsultar: `${basePaths.admin}/padron/consultar`,

  // Simpatizantes
  simpatizantes: `${basePaths.admin}/simpatizantes`,
  simpatizantesRegistrar: `${basePaths.admin}/simpatizantes/registrar`,
  simpatizantesRegistrarPara: `${basePaths.admin}/simpatizantes/registrar/para`,
  simpatizantesLista: `${basePaths.admin}/simpatizantes/lista`,
  simpatizantesRed: `${basePaths.admin}/simpatizantes/red`,
  simpatizantesRedUsuario: (id: string) =>
    `${basePaths.admin}/simpatizantes/red/${id}`,
  simpatizantesSeguimiento: `${basePaths.admin}/simpatizantes/seguimiento`,
  simpatizantesDuplicados: `${basePaths.admin}/simpatizantes/duplicados`,
  simpatizantesCrear: `${basePaths.admin}/simpatizantes/crear`,
  simpatizantesLocales: `${basePaths.admin}/simpatizantes/locales`,
  simpatizantesConsultaVoto: `${basePaths.admin}/simpatizantes/consulta-voto`,
  simpatizantesDashboardVotacion: `${basePaths.admin}/simpatizantes/dashboard-votacion`,

  // Campañas
  campanas: `${basePaths.admin}/campanas`,
  campanasCrear: `${basePaths.admin}/campanas/crear`,
  campanasEditar: (id: string) => `${basePaths.admin}/campanas/editar/${id}`,
  configuracion: `${basePaths.admin}/configuracion`,
  configuracionDetalle: (campanaId: string) =>
    `${basePaths.admin}/configuracion/${campanaId}`,

  // Reportes
  reportes: `${basePaths.admin}/reportes`,
  reportesImprimir: `${basePaths.admin}/reportes/imprimir`,

  // Mapa
  mapa: `${basePaths.admin}/mapa`,

  // Solicitudes
  solicitudes: `${basePaths.admin}/solicitudes`,
  solicitudesCrear: `${basePaths.admin}/solicitudes/crear`,
  solicitudesDetalle: (id: string) => `${basePaths.admin}/solicitudes/${id}`,
  solicitudesDashboard: `${basePaths.admin}/solicitudes/dashboard`,

  // Transportes
  transportes: `${basePaths.admin}/transportes`,
  transportesTransportistas: `${basePaths.admin}/transportes/transportistas`,
  transportesTransportistasCrear: `${basePaths.admin}/transportes/transportistas/crear`,
  transportesTransportistasDetalle: (id: string) =>
    `${basePaths.admin}/transportes/transportistas/${id}`,
  transportesPasajeros: `${basePaths.admin}/transportes/pasajeros`,
  transportesPasajerosRegistrar: `${basePaths.admin}/transportes/pasajeros/registrar`,
  transportesVerificaciones: `${basePaths.admin}/transportes/verificaciones`,
  transportesConfiguracion: `${basePaths.admin}/transportes/configuracion`,
  transportesOperativa: `${basePaths.admin}/transportes/operativa`,
  transportesEscanear: `${basePaths.admin}/transportes/escanear`,
  transportesConfirmar: `${basePaths.admin}/transportes/confirmar`,

  // IMPRESORAS
  impresorasLista: "/admin/impresoras",
  impresorasDetalle: "/admin/impresoras/:id",
  impresorasCrear: "/admin/impresoras/crear",
  impresorasReportes: "/admin/impresoras/reportes",

  // PUESTOS DE CONTROL
  puestosLista: `${basePaths.admin}/puestos`,
  puestosCrear: `${basePaths.admin}/puestos/crear`,
  puestosDetalle: (id: string) => `${basePaths.admin}/puestos/${id}`,

  // ACTIVADOR
  activadorPanel: `${basePaths.admin}/activador`,
  activadorCupos: `${basePaths.admin}/activador/cupos`,

  // VERIFICADOR
  verificadorPanel: `${basePaths.admin}/verificador`,

  // SOLIDARIDAD
  solidaridadPanel: `${basePaths.admin}/solidaridad`,

  // TEMPLATES DE TICKETS
  templateLista: `${basePaths.admin}/templates`,
  templateEditor: (campanaId: string, modo: string) =>
    `${basePaths.admin}/templates/${campanaId}/${modo}`,
};

// Named export para compatibilidad con axios.config.ts
export { RoutesConfig };

export default RoutesConfig;
