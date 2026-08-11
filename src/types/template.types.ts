// src/types/template.types.ts

// ==========================================
// TIPOS DE ELEMENTOS
// ==========================================

export type TipoElemento =
  | "IMAGEN"
  | "TEXTO"
  | "CAMPO_DINAMICO"
  | "QR"
  | "SEPARADOR";

export type CampoDinamico =
  | "{{nombre}}"
  | "{{apellido}}"
  | "{{nombre_completo}}"
  | "{{documento}}"
  | "{{pin}}"
  | "{{local_votacion}}"
  | "{{mesa}}"
  | "{{orden}}"
  | "{{seccional}}"
  | "{{barrio}}"
  | "{{distrito}}"
  | "{{departamento}}"
  | "{{fecha_hora}}";

export type AjusteImagen = "contain" | "cover" | "fill";
export type AlineacionTexto = "left" | "center" | "right";
export type EstiloSeparador = "solido" | "punteado" | "guiones";
export type FormatoFecha = "corta" | "larga" | "completa";
export type FormatoHora = "24h" | "12h";
export type PosicionEtiqueta =
  | "arriba_izq"
  | "arriba_centro"
  | "arriba_der"
  | "abajo_izq"
  | "abajo_centro"
  | "abajo_der"
  | "izq"
  | "centro"
  | "der";
export type ModoEleccionTemplate = "INTERNAS" | "GENERALES";
export type AnchoPapel = 58 | 80;

// ==========================================
// PROPIEDADES POR TIPO DE ELEMENTO
// ==========================================

export interface PropiedadesImagen {
  src: string;
  ajuste: AjusteImagen;
}

export interface PropiedadesTexto {
  contenido: string;
  tamano_fuente: number;
  negrita: boolean;
  cursiva: boolean;
  alineacion: AlineacionTexto;
}

export interface PropiedadesCampoDinamico {
  campo: CampoDinamico;
  formato_fecha: FormatoFecha;
  formato_hora: FormatoHora;
  etiqueta: string;
  posicion_etiqueta: PosicionEtiqueta;
  tamano_fuente: number;
  negrita: boolean;
  cursiva: boolean;
  alineacion: AlineacionTexto;
  mostrar_etiqueta: boolean;
  etiqueta_tamano_fuente: number;
  etiqueta_negrita: boolean;
  etiqueta_cursiva: boolean;
}

export interface PropiedadesQR {
  campo: "{{pin}}";
  tamano: number;
}

export interface PropiedadesSeparador {
  estilo: EstiloSeparador;
  grosor: number;
}

// ==========================================
// ELEMENTOS CON DISCRIMINACION POR TIPO
// ==========================================

export interface ElementoTemplateBase {
  id: string;
  tipo: TipoElemento;
  x: number;
  y: number;
  ancho: number;
  alto: number;
  orden: number;
}

export interface ElementoImagen extends ElementoTemplateBase {
  tipo: "IMAGEN";
  propiedades: PropiedadesImagen;
}

export interface ElementoTexto extends ElementoTemplateBase {
  tipo: "TEXTO";
  propiedades: PropiedadesTexto;
}

export interface ElementoCampoDinamico extends ElementoTemplateBase {
  tipo: "CAMPO_DINAMICO";
  propiedades: PropiedadesCampoDinamico;
}

export interface ElementoQR extends ElementoTemplateBase {
  tipo: "QR";
  propiedades: PropiedadesQR;
}

export interface ElementoSeparador extends ElementoTemplateBase {
  tipo: "SEPARADOR";
  propiedades: PropiedadesSeparador;
}

export type ElementoTemplate =
  | ElementoImagen
  | ElementoTexto
  | ElementoCampoDinamico
  | ElementoQR
  | ElementoSeparador;

// ==========================================
// TEMPLATE COMPLETO
// ==========================================

export interface TemplateTicket {
  id: string;
  campana_id: string;
  modo_eleccion: ModoEleccionTemplate;
  ancho_papel: AnchoPapel;
  elementos: ElementoTemplate[];
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

// ==========================================
// DTOs
// ==========================================

export interface CrearTemplateDto {
  modo_eleccion: ModoEleccionTemplate;
  ancho_papel: AnchoPapel;
  elementos: ElementoTemplate[];
}

export interface ActualizarTemplateDto {
  ancho_papel?: AnchoPapel;
  elementos?: ElementoTemplate[];
  activo?: boolean;
}

// ==========================================
// DATOS DE EJEMPLO PARA PREVIEW
// ==========================================

export interface DatosEjemploTicket {
  nombre: string;
  apellido: string;
  nombre_completo: string;
  documento: string;
  pin: string;
  local_votacion: string;
  mesa: string;
  orden: string;
  seccional: string;
  barrio: string;
  distrito: string;
  departamento: string;
  fecha_hora: string;
}

export const DATOS_EJEMPLO_TICKET: DatosEjemploTicket = {
  nombre: 'JUAN',
  apellido: 'PEREZ',
  nombre_completo: 'JUAN PEREZ',
  documento: '4.500.000',
  pin: 'AB3F7K',
  local_votacion: 'ESCUELA MUNICIPAL N 123',
  mesa: '0045',
  orden: '0123',
  seccional: '025',
  barrio: 'SAN JOSE',
  distrito: 'ASUNCION',
  departamento: 'CENTRAL',
  fecha_hora: '15/06/2025 14:30',
};

// ==========================================
// CAMPOS DINAMICOS DISPONIBLES
// ==========================================

export interface DefinicionCampoDinamico {
  campo: CampoDinamico;
  etiqueta: string;
}

export const CAMPOS_DINAMICOS_DISPONIBLES: DefinicionCampoDinamico[] = [
  { campo: '{{nombre}}', etiqueta: 'Nombre' },
  { campo: '{{apellido}}', etiqueta: 'Apellido' },
  { campo: '{{nombre_completo}}', etiqueta: 'Nombre completo' },
  { campo: '{{documento}}', etiqueta: 'Documento' },
  { campo: '{{pin}}', etiqueta: 'PIN del ticket' },
  { campo: '{{local_votacion}}', etiqueta: 'Local de votacion' },
  { campo: '{{mesa}}', etiqueta: 'Mesa' },
  { campo: '{{orden}}', etiqueta: 'Orden' },
  { campo: '{{seccional}}', etiqueta: 'Seccional' },
  { campo: '{{barrio}}', etiqueta: 'Barrio' },
  { campo: '{{distrito}}', etiqueta: 'Distrito' },
  { campo: '{{departamento}}', etiqueta: 'Departamento' },
  { campo: '{{fecha_hora}}', etiqueta: 'Fecha y hora' },
];
// ==========================================
// FACTOR DE ESCALA PARA EL CANVAS
// ==========================================

export const FACTOR_ESCALA_MM_A_PX = 3.78;

export const ANCHO_CANVAS_PX: Record<AnchoPapel, number> = {
  58: Math.round(58 * FACTOR_ESCALA_MM_A_PX),
  80: Math.round(80 * FACTOR_ESCALA_MM_A_PX),
};
