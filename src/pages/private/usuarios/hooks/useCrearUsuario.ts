// src/pages/private/usuarios/hooks/useCrearUsuario.ts

import type { CreateUsuarioDto } from "@dto/usuario.types";
import { usuariosService } from "@services/usuarios.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

interface ErrorUsuarioInactivoPayload {
  codigo: "USUARIO_EXISTENTE_INACTIVO_MODO";
  mensaje: string;
  usuario_id: string;
  modo_eleccion: "INTERNAS" | "GENERALES";
}

interface ErrorResponse {
  message: string | ErrorUsuarioInactivoPayload;
}

export const useCrearUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUsuarioDto) => usuariosService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["usuarios"],
        refetchType: "all",
      });
      toast.success("Usuario creado exitosamente");
    },
    onError: (error) => {
      if (axios.isAxiosError<ErrorResponse>(error) && error.response?.data?.message) {
        const payload = error.response.data.message;

        if (typeof payload === "object" && payload !== null && "codigo" in payload) {
          // Bypass: el componente CrearUsuario.tsx manejará localmente este error estructurado
          return;
        }

        toast.error(typeof payload === "string" ? payload : "Error al crear el usuario");
      } else {
        toast.error("Error al crear el usuario");
      }
    },
  });
};