-- CreateTable
CREATE TABLE "public"."campanas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nivel_campana" TEXT NOT NULL DEFAULT 'DISTRITO',
    "departamento" TEXT,
    "distrito" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campanas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."configuraciones_campanas" (
    "id" TEXT NOT NULL,
    "campana_id" TEXT NOT NULL,
    "modo_eleccion" TEXT NOT NULL DEFAULT 'INTERNAS',

    CONSTRAINT "configuraciones_campanas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."niveles" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "descripcion" TEXT,
    "permite_operadores" BOOLEAN NOT NULL DEFAULT false,
    "exclusivo_root" BOOLEAN NOT NULL DEFAULT false,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "niveles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."perfiles" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nivel_id" TEXT,
    "es_operativo" BOOLEAN NOT NULL DEFAULT false,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "perfiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permisos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "modulo" TEXT NOT NULL,
    "accion" TEXT NOT NULL,

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."perfil_permisos" (
    "perfil_id" TEXT NOT NULL,
    "permiso_id" TEXT NOT NULL,

    CONSTRAINT "perfil_permisos_pkey" PRIMARY KEY ("perfil_id","permiso_id")
);

-- CreateTable
CREATE TABLE "public"."permisos_personalizados" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "permiso_id" TEXT NOT NULL,
    "asignado_por_id" TEXT NOT NULL,

    CONSTRAINT "permisos_personalizados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usuarios" (
    "id" TEXT NOT NULL,
    "campana_id" TEXT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "telefono" TEXT,
    "password" TEXT NOT NULL,
    "perfil_id" TEXT NOT NULL,
    "nivel_id" TEXT,
    "candidato_superior_id" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "eliminado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refresh_token" TEXT,
    "creado_por_id" TEXT,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."simpatizantes" (
    "id" TEXT NOT NULL,
    "campana_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "telefono" TEXT,
    "fecha_nacimiento" TEXT,
    "departamento" TEXT,
    "distrito" TEXT,
    "barrio" TEXT,
    "seccional" TEXT,
    "local_votacion" TEXT,
    "mesa_votacion" TEXT,
    "orden_votacion" TEXT,
    "es_afiliado" BOOLEAN NOT NULL DEFAULT false,
    "intencion_voto" TEXT NOT NULL DEFAULT 'INDECISO',
    "observaciones" TEXT,
    "origen_registro" TEXT NOT NULL DEFAULT 'PADRON_INTERNO',
    "necesita_transporte" BOOLEAN NOT NULL DEFAULT false,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "candidato_id" TEXT,
    "lider_id" TEXT,
    "registrado_por_id" TEXT NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eliminado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "simpatizantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."eventos" (
    "id" TEXT NOT NULL,
    "campana_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "fecha_hora_inicio" TIMESTAMP(3) NOT NULL,
    "direccion" TEXT,
    "barrio" TEXT,
    "ciudad" TEXT,
    "tipo_evento" TEXT NOT NULL,
    "capacidad_estimada" INTEGER,
    "estado" TEXT NOT NULL DEFAULT 'planificado',
    "candidato_id" TEXT NOT NULL,
    "creado_por_id" TEXT NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eliminado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asistencias" (
    "id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,
    "simpatizante_id" TEXT NOT NULL,
    "confirmado_previamente" BOOLEAN NOT NULL DEFAULT false,
    "asistio" BOOLEAN NOT NULL DEFAULT false,
    "fecha_hora_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."padron_interno" (
    "id" TEXT NOT NULL,
    "ci" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "fecha_nacimiento" TEXT,
    "departamento" TEXT,
    "distrito" TEXT,
    "seccional" TEXT,
    "local_votacion" TEXT,
    "mesa" TEXT,
    "orden" TEXT,
    "fecha_carga" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "padron_interno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."padron_general" (
    "id" TEXT NOT NULL,
    "ci" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "fecha_nacimiento" TEXT,
    "departamento" TEXT,
    "distrito" TEXT,
    "local_votacion" TEXT,
    "mesa" TEXT,
    "orden" TEXT,
    "fecha_carga" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "padron_general_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."direcciones" (
    "id" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "barrio" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" TEXT,
    "fecha_carga" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "direcciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."auditoria_logs" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "accion" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "entidad_id" TEXT,
    "entidad_tipo" TEXT,
    "datos_antes" JSONB,
    "datos_despues" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "fecha_accion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seguimientos_simpatizantes" (
    "id" TEXT NOT NULL,
    "simpatizante_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo_contacto" TEXT NOT NULL,
    "resultado" TEXT NOT NULL,
    "intencion_voto" TEXT,
    "observaciones" TEXT,
    "fecha_contacto" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seguimientos_simpatizantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."solicitudes" (
    "id" TEXT NOT NULL,
    "campana_id" TEXT NOT NULL,
    "simpatizante_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "prioridad" TEXT NOT NULL DEFAULT 'MEDIA',
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "registrado_por_id" TEXT NOT NULL,
    "asignado_a_id" TEXT,
    "candidato_id" TEXT,
    "lider_id" TEXT,
    "fecha_limite" TIMESTAMP(3),
    "fecha_cierre" TIMESTAMP(3),
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eliminado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "solicitudes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."movimientos_solicitudes" (
    "id" TEXT NOT NULL,
    "solicitud_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "comentario" TEXT,
    "estado_anterior" TEXT,
    "estado_nuevo" TEXT,
    "asignado_anterior_id" TEXT,
    "asignado_nuevo_id" TEXT,
    "fecha_movimiento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_solicitudes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transportistas" (
    "id" TEXT NOT NULL,
    "campana_id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "registrado_por_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "telefono" TEXT,
    "tipo_vehiculo" TEXT NOT NULL,
    "marca_vehiculo" TEXT,
    "chapa_vehiculo" TEXT NOT NULL,
    "capacidad_pasajeros" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eliminado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "transportistas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pasajeros_transporte" (
    "id" TEXT NOT NULL,
    "transportista_id" TEXT NOT NULL,
    "simpatizante_id" TEXT NOT NULL,
    "es_duplicado" BOOLEAN NOT NULL DEFAULT false,
    "confirmado" BOOLEAN NOT NULL DEFAULT false,
    "fue_por_cuenta" BOOLEAN NOT NULL DEFAULT false,
    "hora_recogida" TIMESTAMP(3),
    "registrado_por_id" TEXT NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_confirmacion" TIMESTAMP(3),

    CONSTRAINT "pasajeros_transporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."configuraciones_transporte" (
    "id" TEXT NOT NULL,
    "campana_id" TEXT NOT NULL,
    "permitir_impresion_tickets" BOOLEAN NOT NULL DEFAULT false,
    "permitir_duplicados" BOOLEAN NOT NULL DEFAULT true,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuraciones_transporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verificaciones_transporte" (
    "id" TEXT NOT NULL,
    "campana_id" TEXT NOT NULL,
    "documento_buscado" TEXT NOT NULL,
    "nombre_referencia" TEXT,
    "apellido_referencia" TEXT,
    "transportista_id" TEXT NOT NULL,
    "operador_id" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "motivo_rechazo" TEXT,
    "simpatizante_id" TEXT,
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_resolucion" TIMESTAMP(3),

    CONSTRAINT "verificaciones_transporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LoteConfirmacionTransporte" (
    "id" TEXT NOT NULL,
    "transportista_id" TEXT NOT NULL,
    "hash_lote" TEXT NOT NULL,
    "pasajeros_ids" TEXT[],
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_expiracion" TIMESTAMP(3) NOT NULL,
    "utilizado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LoteConfirmacionTransporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Impresora" (
    "id" TEXT NOT NULL,
    "campana_id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "ubicacion" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'DESCONECTADA',
    "ip_ultima" TEXT,
    "hostname_ultimo" TEXT,
    "ultima_conexion" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por_id" TEXT NOT NULL,

    CONSTRAINT "Impresora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UsuarioImpresora" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "impresora_id" TEXT NOT NULL,
    "es_principal" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioImpresora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrabajoImpresion" (
    "id" TEXT NOT NULL,
    "impresora_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "datos" JSONB NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "error" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "procesado_en" TIMESTAMP(3),

    CONSTRAINT "TrabajoImpresion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "configuraciones_campanas_campana_id_key" ON "public"."configuraciones_campanas"("campana_id");

-- CreateIndex
CREATE UNIQUE INDEX "niveles_nombre_key" ON "public"."niveles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "niveles_orden_key" ON "public"."niveles"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "perfiles_nombre_key" ON "public"."perfiles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_nombre_key" ON "public"."permisos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_personalizados_usuario_id_permiso_id_key" ON "public"."permisos_personalizados"("usuario_id", "permiso_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "public"."usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_documento_key" ON "public"."usuarios"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "simpatizantes_documento_campana_id_key" ON "public"."simpatizantes"("documento", "campana_id");

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_evento_id_simpatizante_id_key" ON "public"."asistencias"("evento_id", "simpatizante_id");

-- CreateIndex
CREATE UNIQUE INDEX "padron_interno_ci_key" ON "public"."padron_interno"("ci");

-- CreateIndex
CREATE UNIQUE INDEX "padron_general_ci_key" ON "public"."padron_general"("ci");

-- CreateIndex
CREATE UNIQUE INDEX "direcciones_departamento_ciudad_barrio_key" ON "public"."direcciones"("departamento", "ciudad", "barrio");

-- CreateIndex
CREATE INDEX "auditoria_logs_usuario_id_idx" ON "public"."auditoria_logs"("usuario_id");

-- CreateIndex
CREATE INDEX "auditoria_logs_modulo_idx" ON "public"."auditoria_logs"("modulo");

-- CreateIndex
CREATE INDEX "auditoria_logs_accion_idx" ON "public"."auditoria_logs"("accion");

-- CreateIndex
CREATE INDEX "auditoria_logs_fecha_accion_idx" ON "public"."auditoria_logs"("fecha_accion");

-- CreateIndex
CREATE INDEX "seguimientos_simpatizantes_simpatizante_id_idx" ON "public"."seguimientos_simpatizantes"("simpatizante_id");

-- CreateIndex
CREATE INDEX "seguimientos_simpatizantes_usuario_id_idx" ON "public"."seguimientos_simpatizantes"("usuario_id");

-- CreateIndex
CREATE INDEX "seguimientos_simpatizantes_fecha_contacto_idx" ON "public"."seguimientos_simpatizantes"("fecha_contacto");

-- CreateIndex
CREATE INDEX "solicitudes_campana_id_idx" ON "public"."solicitudes"("campana_id");

-- CreateIndex
CREATE INDEX "solicitudes_simpatizante_id_idx" ON "public"."solicitudes"("simpatizante_id");

-- CreateIndex
CREATE INDEX "solicitudes_registrado_por_id_idx" ON "public"."solicitudes"("registrado_por_id");

-- CreateIndex
CREATE INDEX "solicitudes_asignado_a_id_idx" ON "public"."solicitudes"("asignado_a_id");

-- CreateIndex
CREATE INDEX "solicitudes_estado_idx" ON "public"."solicitudes"("estado");

-- CreateIndex
CREATE INDEX "solicitudes_prioridad_idx" ON "public"."solicitudes"("prioridad");

-- CreateIndex
CREATE INDEX "movimientos_solicitudes_solicitud_id_idx" ON "public"."movimientos_solicitudes"("solicitud_id");

-- CreateIndex
CREATE INDEX "movimientos_solicitudes_usuario_id_idx" ON "public"."movimientos_solicitudes"("usuario_id");

-- CreateIndex
CREATE INDEX "transportistas_campana_id_idx" ON "public"."transportistas"("campana_id");

-- CreateIndex
CREATE INDEX "transportistas_documento_idx" ON "public"."transportistas"("documento");

-- CreateIndex
CREATE INDEX "pasajeros_transporte_transportista_id_idx" ON "public"."pasajeros_transporte"("transportista_id");

-- CreateIndex
CREATE INDEX "pasajeros_transporte_simpatizante_id_idx" ON "public"."pasajeros_transporte"("simpatizante_id");

-- CreateIndex
CREATE INDEX "pasajeros_transporte_hora_recogida_idx" ON "public"."pasajeros_transporte"("hora_recogida");

-- CreateIndex
CREATE UNIQUE INDEX "configuraciones_transporte_campana_id_key" ON "public"."configuraciones_transporte"("campana_id");

-- CreateIndex
CREATE INDEX "verificaciones_transporte_campana_id_idx" ON "public"."verificaciones_transporte"("campana_id");

-- CreateIndex
CREATE INDEX "verificaciones_transporte_documento_buscado_idx" ON "public"."verificaciones_transporte"("documento_buscado");

-- CreateIndex
CREATE INDEX "verificaciones_transporte_estado_idx" ON "public"."verificaciones_transporte"("estado");

-- CreateIndex
CREATE INDEX "verificaciones_transporte_transportista_id_idx" ON "public"."verificaciones_transporte"("transportista_id");

-- CreateIndex
CREATE UNIQUE INDEX "LoteConfirmacionTransporte_hash_lote_key" ON "public"."LoteConfirmacionTransporte"("hash_lote");

-- CreateIndex
CREATE INDEX "LoteConfirmacionTransporte_transportista_id_idx" ON "public"."LoteConfirmacionTransporte"("transportista_id");

-- CreateIndex
CREATE INDEX "LoteConfirmacionTransporte_hash_lote_idx" ON "public"."LoteConfirmacionTransporte"("hash_lote");

-- CreateIndex
CREATE UNIQUE INDEX "Impresora_codigo_key" ON "public"."Impresora"("codigo");

-- CreateIndex
CREATE INDEX "Impresora_campana_id_idx" ON "public"."Impresora"("campana_id");

-- CreateIndex
CREATE INDEX "Impresora_codigo_idx" ON "public"."Impresora"("codigo");

-- CreateIndex
CREATE INDEX "Impresora_estado_idx" ON "public"."Impresora"("estado");

-- CreateIndex
CREATE INDEX "UsuarioImpresora_usuario_id_idx" ON "public"."UsuarioImpresora"("usuario_id");

-- CreateIndex
CREATE INDEX "UsuarioImpresora_impresora_id_idx" ON "public"."UsuarioImpresora"("impresora_id");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioImpresora_usuario_id_impresora_id_key" ON "public"."UsuarioImpresora"("usuario_id", "impresora_id");

-- CreateIndex
CREATE INDEX "TrabajoImpresion_impresora_id_estado_idx" ON "public"."TrabajoImpresion"("impresora_id", "estado");

-- CreateIndex
CREATE INDEX "TrabajoImpresion_estado_idx" ON "public"."TrabajoImpresion"("estado");

-- AddForeignKey
ALTER TABLE "public"."configuraciones_campanas" ADD CONSTRAINT "configuraciones_campanas_campana_id_fkey" FOREIGN KEY ("campana_id") REFERENCES "public"."campanas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."perfiles" ADD CONSTRAINT "perfiles_nivel_id_fkey" FOREIGN KEY ("nivel_id") REFERENCES "public"."niveles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."perfil_permisos" ADD CONSTRAINT "perfil_permisos_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "public"."permisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."perfil_permisos" ADD CONSTRAINT "perfil_permisos_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."permisos_personalizados" ADD CONSTRAINT "permisos_personalizados_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "public"."permisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."permisos_personalizados" ADD CONSTRAINT "permisos_personalizados_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_campana_id_fkey" FOREIGN KEY ("campana_id") REFERENCES "public"."campanas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_nivel_id_fkey" FOREIGN KEY ("nivel_id") REFERENCES "public"."niveles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_candidato_superior_id_fkey" FOREIGN KEY ("candidato_superior_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."simpatizantes" ADD CONSTRAINT "simpatizantes_campana_id_fkey" FOREIGN KEY ("campana_id") REFERENCES "public"."campanas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."eventos" ADD CONSTRAINT "eventos_campana_id_fkey" FOREIGN KEY ("campana_id") REFERENCES "public"."campanas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asistencias" ADD CONSTRAINT "asistencias_simpatizante_id_fkey" FOREIGN KEY ("simpatizante_id") REFERENCES "public"."simpatizantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asistencias" ADD CONSTRAINT "asistencias_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "public"."eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seguimientos_simpatizantes" ADD CONSTRAINT "seguimientos_simpatizantes_simpatizante_id_fkey" FOREIGN KEY ("simpatizante_id") REFERENCES "public"."simpatizantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solicitudes" ADD CONSTRAINT "solicitudes_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solicitudes" ADD CONSTRAINT "solicitudes_asignado_a_id_fkey" FOREIGN KEY ("asignado_a_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solicitudes" ADD CONSTRAINT "solicitudes_candidato_id_fkey" FOREIGN KEY ("candidato_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solicitudes" ADD CONSTRAINT "solicitudes_lider_id_fkey" FOREIGN KEY ("lider_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solicitudes" ADD CONSTRAINT "solicitudes_campana_id_fkey" FOREIGN KEY ("campana_id") REFERENCES "public"."campanas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solicitudes" ADD CONSTRAINT "solicitudes_simpatizante_id_fkey" FOREIGN KEY ("simpatizante_id") REFERENCES "public"."simpatizantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movimientos_solicitudes" ADD CONSTRAINT "movimientos_solicitudes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movimientos_solicitudes" ADD CONSTRAINT "movimientos_solicitudes_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "public"."solicitudes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transportistas" ADD CONSTRAINT "transportistas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transportistas" ADD CONSTRAINT "transportistas_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transportistas" ADD CONSTRAINT "transportistas_campana_id_fkey" FOREIGN KEY ("campana_id") REFERENCES "public"."campanas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pasajeros_transporte" ADD CONSTRAINT "pasajeros_transporte_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pasajeros_transporte" ADD CONSTRAINT "pasajeros_transporte_transportista_id_fkey" FOREIGN KEY ("transportista_id") REFERENCES "public"."transportistas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pasajeros_transporte" ADD CONSTRAINT "pasajeros_transporte_simpatizante_id_fkey" FOREIGN KEY ("simpatizante_id") REFERENCES "public"."simpatizantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."configuraciones_transporte" ADD CONSTRAINT "configuraciones_transporte_campana_id_fkey" FOREIGN KEY ("campana_id") REFERENCES "public"."campanas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."verificaciones_transporte" ADD CONSTRAINT "verificaciones_transporte_transportista_id_fkey" FOREIGN KEY ("transportista_id") REFERENCES "public"."transportistas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."verificaciones_transporte" ADD CONSTRAINT "verificaciones_transporte_operador_id_fkey" FOREIGN KEY ("operador_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."verificaciones_transporte" ADD CONSTRAINT "verificaciones_transporte_simpatizante_id_fkey" FOREIGN KEY ("simpatizante_id") REFERENCES "public"."simpatizantes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."verificaciones_transporte" ADD CONSTRAINT "verificaciones_transporte_campana_id_fkey" FOREIGN KEY ("campana_id") REFERENCES "public"."campanas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LoteConfirmacionTransporte" ADD CONSTRAINT "LoteConfirmacionTransporte_transportista_id_fkey" FOREIGN KEY ("transportista_id") REFERENCES "public"."transportistas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Impresora" ADD CONSTRAINT "Impresora_campana_id_fkey" FOREIGN KEY ("campana_id") REFERENCES "public"."campanas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Impresora" ADD CONSTRAINT "Impresora_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UsuarioImpresora" ADD CONSTRAINT "UsuarioImpresora_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UsuarioImpresora" ADD CONSTRAINT "UsuarioImpresora_impresora_id_fkey" FOREIGN KEY ("impresora_id") REFERENCES "public"."Impresora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrabajoImpresion" ADD CONSTRAINT "TrabajoImpresion_impresora_id_fkey" FOREIGN KEY ("impresora_id") REFERENCES "public"."Impresora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrabajoImpresion" ADD CONSTRAINT "TrabajoImpresion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
