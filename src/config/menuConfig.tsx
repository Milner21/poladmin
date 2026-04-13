//src/config/menuConfig.tsx
import {
  BarChart3,
  Building2,
  Calendar,
  CheckSquare,
  FileSpreadsheet,
  Layers,
  LayoutDashboard,
  Map,
  Shield,
  UserPlus,
  Users,
  UsersRound,
  ClipboardList,
  Truck,
  Settings,
  Monitor,
  Scan,
  Printer,
  Flag,
  Copy,
} from "lucide-react";
import RoutesConfig from "@routes/RoutesConfig";
import type { MenuItem } from "../types/layout.types";

export interface MenuItemConfig extends MenuItem {
  modulo?: string;
  permisoEspecifico?: string;
}

export const menuConfig: MenuItemConfig[] = [
  // ==========================================
  // DASHBOARD
  // ==========================================
  {
    key: "dashboard",
    icon: <LayoutDashboard size={18} />,
    label: "Dashboard",
    path: RoutesConfig.dashboard,
  },

  // ==========================================
  // ADMINISTRACIÓN (Solo ROOT)
  // ==========================================
  {
    key: "partidos",
    icon: <Flag size={18} />,
    label: "Partidos",
    path: RoutesConfig.partidos,
    modulo: "campanas",
  },
  {
    key: "campanas",
    icon: <Building2 size={18} />,
    label: "Campañas",
    path: RoutesConfig.campanas,
    modulo: "campanas",
  },
  {
    key: "configuracion",
    icon: <Settings size={18} />,
    label: "Configuración",
    path: RoutesConfig.configuracion,
    modulo: "campanas",
  },
  {
    key: "niveles",
    icon: <Layers size={18} />,
    label: "Niveles",
    path: RoutesConfig.niveles,
    modulo: "niveles",
  },
  {
    key: "permisos",
    icon: <Shield size={18} />,
    label: "Permisos",
    path: RoutesConfig.permisos,
    modulo: "permisos",
  },
  {
    key: "perfiles",
    icon: <UsersRound size={18} />,
    label: "Perfiles",
    path: RoutesConfig.perfiles,
    modulo: "perfiles",
  },
  {
    key: "usuarios",
    icon: <Users size={18} />,
    label: "Usuarios",
    path: RoutesConfig.usuarios,
    modulo: "usuarios",
  },

  // ==========================================
  // PADRÓN
  // ==========================================
  {
    key: "padron",
    icon: <FileSpreadsheet size={18} />,
    label: "Cargar Padrón",
    path: RoutesConfig.padronCargar,
    modulo: "padron",
  },
  // ==========================================
  // SIMPATIZANTES
  // ==========================================
  {
    key: "simpatizantes-registrar",
    icon: <UserPlus size={18} />,
    label: "Registrar Simpatizante",
    path: RoutesConfig.simpatizantesRegistrar,
    modulo: "simpatizantes",
    permisoEspecifico: "crear_simpatizante",
  },
  {
    key: "simpatizantes-lista",
    icon: <Users size={18} />,
    label: "Simpatizantes",
    path: RoutesConfig.simpatizantesLista,
    modulo: "simpatizantes",
    permisoEspecifico: "ver_lista_simpatizantes",
  },
  {
    key: "simpatizantes-red",
    icon: <UsersRound size={18} />,
    label: "Red de Simpatizantes",
    path: RoutesConfig.simpatizantesRed,
    modulo: "simpatizantes",
    permisoEspecifico: "gestionar_red_simpatizantes",
  },
  {
    key: "simpatizantes-seguimiento",
    icon: <ClipboardList size={18} />,
    label: "Seguimiento",
    path: RoutesConfig.simpatizantesSeguimiento,
    modulo: "simpatizantes",
    permisoEspecifico: "registrar_seguimiento_simpatizante",
  },
  {
    key: "simpatizantes-duplicados",
    icon: <Copy size={18} />,
    label: "Duplicados",
    path: RoutesConfig.simpatizantesDuplicados,
    modulo: "simpatizantes",
    permisoEspecifico: "ver_simpatizante",
  },

  // ==========================================
  // SOLICITUDES
  // ==========================================
  {
    key: "solicitudes",
    icon: <ClipboardList size={18} />,
    label: "Solicitudes",
    path: RoutesConfig.solicitudes,
    modulo: "solicitudes",
  },

  // ==========================================
  // TRANSPORTES - OPERATIVA (Solo Transportistas)
  // ==========================================
  {
    key: "transportes-operativa",
    icon: <Truck size={18} />,
    label: "Mi Operativa",
    path: RoutesConfig.transportesOperativa,
    modulo: "transportes",
    permisoEspecifico: "ver_operativa_transportista",
  },

  // ==========================================
  // TRANSPORTES - OPERADOR (Escáner y Confirmación)
  // ==========================================
  {
    key: "transportes-escanear",
    icon: <Scan size={18} />,
    label: "Escanear QR",
    path: RoutesConfig.transportesEscanear,
    modulo: "transportes",
    permisoEspecifico: "confirmar_transporte",
  },
  {
    key: "transportes-confirmar",
    icon: <Monitor size={18} />,
    label: "Gestión de Viajes",
    path: RoutesConfig.transportesConfirmar,
    modulo: "transportes",
    permisoEspecifico: "confirmar_transporte",
  },

  // ==========================================
  // TRANSPORTES - GESTIÓN (Administradores/Operadores)
  // ==========================================
  {
    key: "transportes-transportistas",
    icon: <Truck size={18} />,
    label: "Transportistas",
    path: RoutesConfig.transportesTransportistas,
    modulo: "transportes",
    permisoEspecifico: "ver_gestion_transportes",
  },
  {
    key: "transportes-pasajeros",
    icon: <Users size={18} />,
    label: "Pasajeros",
    path: RoutesConfig.transportesPasajeros,
    modulo: "transportes",
    permisoEspecifico: "ver_gestion_transportes",
  },
  {
    key: "transportes-verificaciones",
    icon: <CheckSquare size={18} />,
    label: "Verificaciones",
    path: RoutesConfig.transportesVerificaciones,
    modulo: "transportes",
    permisoEspecifico: "ver_gestion_transportes",
  },
  {
    key: "transportes-configuracion",
    icon: <Settings size={18} />,
    label: "Config. Transporte",
    path: RoutesConfig.transportesConfiguracion,
    modulo: "transportes",
    permisoEspecifico: "ver_gestion_transportes",
  },

  // ==========================================
  // EVENTOS Y ASISTENCIAS
  // ==========================================
  {
    key: "eventos",
    icon: <Calendar size={18} />,
    label: "Eventos",
    path: RoutesConfig.eventos,
    modulo: "eventos",
  },
  {
    key: "asistencias",
    icon: <CheckSquare size={18} />,
    label: "Asistencias",
    path: "/admin/asistencias",
    modulo: "asistencias",
  },

  // ==========================================
  // REPORTES Y ANÁLISIS
  // ==========================================
  {
    key: "reportes",
    icon: <BarChart3 size={18} />,
    label: "Reportes",
    path: RoutesConfig.reportes,
    modulo: "dashboard",
  },
  {
    key: "mapa",
    icon: <Map size={18} />,
    label: "Mapa de Calor",
    path: RoutesConfig.mapa,
    modulo: "dashboard",
  },
  {
    key: "impresoras",
    icon: <Printer size={18} />,
    label: "Impresoras",
    path: RoutesConfig.impresorasLista,
    modulo: "impresoras",
  },
  {
    key: "impresoras-lista",
    icon: <Printer size={18} />,
    label: "Gestión de Impresoras",
    path: RoutesConfig.impresorasCrear,
    modulo: "impresoras",
  },
];
