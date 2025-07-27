// services/eventoService.ts
import { supabase } from "./supabase";
import type {
  Evento,
  VotanteParaEvento,
  AsistenciaEvento,
} from "../types/eventos";

// Interface para los datos raw que vienen de Supabase
interface VotanteRawFromSupabase {
  id: string;
  ci: string;
  nombre: string;
  apellido: string;
  telefono: string;
  barrio: string;
  sexo: string;
  edad: number;
  asistencias_eventos?: AsistenciaEvento[];
}

export class EventoService {
  static async getEventos(): Promise<Evento[]> {
    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .eq("activo", true)
      .order("fecha_evento", { ascending: false });

    if (error) throw error;
    return data as Evento[];
  }

  static async getVotantesParaEvento(
    eventoId: string,
    searchTerm: string = ""
  ): Promise<VotanteParaEvento[]> {
    let query = supabase.from("votantes").select(`
        id, ci, nombre, apellido, telefono, barrio, sexo, edad,
        asistencias_eventos!left(id)
      `);

    // Filtro de búsqueda
    if (searchTerm) {
      query = query.or(
        `ci.ilike.%${searchTerm}%,nombre.ilike.%${searchTerm}%,apellido.ilike.%${searchTerm}%,barrio.ilike.%${searchTerm}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    // Procesar datos para indicar si ya asistió
    return (data as VotanteRawFromSupabase[]).map(
      (votante): VotanteParaEvento => ({
        id: votante.id,
        ci: votante.ci,
        nombre: votante.nombre,
        apellido: votante.apellido,
        telefono: votante.telefono,
        barrio: votante.barrio,
        sexo: votante.sexo,
        edad: votante.edad,
        ya_asistio:
          votante.asistencias_eventos?.some(
            (asistencia: AsistenciaEvento) => asistencia.evento_id === eventoId
          ) || false,
      })
    );
  }

  static async registrarAsistencia(
    eventoId: string,
    votante: VotanteParaEvento,
    registradoPor: string = "usuario"
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const { error } = await supabase.from("asistencias_eventos").insert({
        evento_id: eventoId,
        votante_id: votante.id,
        votante_ci: votante.ci,
        votante_nombre: votante.nombre,
        votante_apellido: votante.apellido,
        votante_telefono: votante.telefono,
        votante_barrio: votante.barrio,
        registrado_por: registradoPor,
      });

      if (error) {
        if (error.code === "23505") {
          // unique_violation
          return {
            success: false,
            error: "Este votante ya está registrado en el evento",
          };
        }
        throw error;
      }

      return {
        success: true,
        message: "Asistencia registrada exitosamente",
      };
    } catch {
      return {
        success: false,
        error: "Error al registrar la asistencia",
      };
    }
  }

  static async getAsistenciasEvento(
    eventoId: string
  ): Promise<AsistenciaEvento[]> {
    const { data, error } = await supabase
      .from("asistencias_eventos")
      .select("*")
      .eq("evento_id", eventoId)
      .order("fecha_asistencia", { ascending: false });

    if (error) throw error;
    return data as AsistenciaEvento[];
  }
}
