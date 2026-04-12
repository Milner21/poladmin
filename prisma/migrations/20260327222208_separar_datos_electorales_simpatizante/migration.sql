/*
  Warnings:

  - You are about to drop the column `local_votacion` on the `simpatizantes` table. All the data in the column will be lost.
  - You are about to drop the column `mesa_votacion` on the `simpatizantes` table. All the data in the column will be lost.
  - You are about to drop the column `orden_votacion` on the `simpatizantes` table. All the data in the column will be lost.
  - You are about to drop the column `seccional` on the `simpatizantes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."simpatizantes" DROP COLUMN "local_votacion",
DROP COLUMN "mesa_votacion",
DROP COLUMN "orden_votacion",
DROP COLUMN "seccional",
ADD COLUMN     "local_votacion_general" TEXT,
ADD COLUMN     "local_votacion_interna" TEXT,
ADD COLUMN     "mesa_votacion_general" TEXT,
ADD COLUMN     "mesa_votacion_interna" TEXT,
ADD COLUMN     "orden_votacion_general" TEXT,
ADD COLUMN     "orden_votacion_interna" TEXT,
ADD COLUMN     "seccional_interna" TEXT;
