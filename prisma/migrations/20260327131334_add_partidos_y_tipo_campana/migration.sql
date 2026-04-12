/*
  Warnings:

  - A unique constraint covering the columns `[ci,partido_id]` on the table `padron_interno` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."padron_interno_ci_key";

-- AlterTable
ALTER TABLE "public"."campanas" ADD COLUMN     "partido_id" TEXT,
ADD COLUMN     "tipo_campana" TEXT NOT NULL DEFAULT 'PARTIDO';

-- AlterTable
ALTER TABLE "public"."padron_interno" ADD COLUMN     "partido_id" TEXT;

-- CreateTable
CREATE TABLE "public"."partidos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partidos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partidos_nombre_key" ON "public"."partidos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "partidos_sigla_key" ON "public"."partidos"("sigla");

-- CreateIndex
CREATE INDEX "padron_interno_partido_id_idx" ON "public"."padron_interno"("partido_id");

-- CreateIndex
CREATE UNIQUE INDEX "padron_interno_ci_partido_id_key" ON "public"."padron_interno"("ci", "partido_id");

-- AddForeignKey
ALTER TABLE "public"."campanas" ADD CONSTRAINT "campanas_partido_id_fkey" FOREIGN KEY ("partido_id") REFERENCES "public"."partidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."padron_interno" ADD CONSTRAINT "padron_interno_partido_id_fkey" FOREIGN KEY ("partido_id") REFERENCES "public"."partidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
