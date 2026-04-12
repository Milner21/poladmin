-- AlterTable
ALTER TABLE "public"."duplicados_simpatizantes" ADD COLUMN     "eliminado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "eliminado_por_id" TEXT,
ADD COLUMN     "es_dueno_confirmado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fecha_eliminacion" TIMESTAMP(3),
ADD COLUMN     "fecha_resolucion" TIMESTAMP(3),
ADD COLUMN     "resuelto_por_id" TEXT;

-- AddForeignKey
ALTER TABLE "public"."duplicados_simpatizantes" ADD CONSTRAINT "duplicados_simpatizantes_eliminado_por_id_fkey" FOREIGN KEY ("eliminado_por_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."duplicados_simpatizantes" ADD CONSTRAINT "duplicados_simpatizantes_resuelto_por_id_fkey" FOREIGN KEY ("resuelto_por_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
