// src/pages/private/templates/hooks/useTemplates.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesService } from '@services/templates.service';
import type {
  TemplateTicket,
  CrearTemplateDto,
  ModoEleccionTemplate,
} from '@dto/template.types';
import toast from 'react-hot-toast';

// ==========================================
// LISTAR TEMPLATES DE LA CAMPANA
// ==========================================

export function useTemplates() {
  return useQuery<TemplateTicket[]>({
    queryKey: ['templates'],
    queryFn: templatesService.listar,
  });
}

// ==========================================
// OBTENER TEMPLATE POR MODO
// ==========================================

export function useTemplatePorModo(modo: ModoEleccionTemplate | null) {
  return useQuery<TemplateTicket>({
    queryKey: ['templates', modo],
    queryFn: () => templatesService.obtenerPorModo(modo as string),
    enabled: modo !== null,
    retry: false,
  });
}

// ==========================================
// GUARDAR O ACTUALIZAR TEMPLATE
// ==========================================

export function useGuardarTemplate() {
  const queryClient = useQueryClient();

  return useMutation<
    TemplateTicket,
    Error,
    { modo: ModoEleccionTemplate; dto: CrearTemplateDto }
  >({
    mutationFn: ({ modo, dto }) =>
      templatesService.guardarOActualizar(modo, dto),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['templates'] });
      void queryClient.invalidateQueries({
        queryKey: ['templates', variables.modo],
      });
      toast.success('Template guardado correctamente');
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Error al guardar el template');
      }
    },
  });
}