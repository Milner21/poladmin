-- AlterTable
ALTER TABLE "public"."configuraciones_campanas" ADD COLUMN     "permitir_duplicados_simpatizantes" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "permitir_registro_manual_fuera_padron" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."pasajeros_transporte" ADD COLUMN     "eliminado" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."duplicados_simpatizantes" (
    "id" TEXT NOT NULL,
    "campana_id" TEXT NOT NULL,
    "simpatizante_id" TEXT NOT NULL,
    "registrado_por_id_original" TEXT NOT NULL,
    "intento_registrar_id" TEXT NOT NULL,
    "fecha_intento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "duplicados_simpatizantes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "duplicados_simpatizantes_campana_id_idx" ON "public"."duplicados_simpatizantes"("campana_id");

-- CreateIndex
CREATE INDEX "duplicados_simpatizantes_simpatizante_id_idx" ON "public"."duplicados_simpatizantes"("simpatizante_id");

-- CreateIndex
CREATE INDEX "duplicados_simpatizantes_intento_registrar_id_idx" ON "public"."duplicados_simpatizantes"("intento_registrar_id");

-- AddForeignKey
ALTER TABLE "public"."duplicados_simpatizantes" ADD CONSTRAINT "duplicados_simpatizantes_campana_id_fkey" FOREIGN KEY ("campana_id") REFERENCES "public"."campanas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."duplicados_simpatizantes" ADD CONSTRAINT "duplicados_simpatizantes_simpatizante_id_fkey" FOREIGN KEY ("simpatizante_id") REFERENCES "public"."simpatizantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."duplicados_simpatizantes" ADD CONSTRAINT "duplicados_simpatizantes_intento_registrar_id_fkey" FOREIGN KEY ("intento_registrar_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."duplicados_simpatizantes" ADD CONSTRAINT "duplicados_simpatizantes_registrado_por_id_original_fkey" FOREIGN KEY ("registrado_por_id_original") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
