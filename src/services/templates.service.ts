// src/services/templates.service.ts

import api from '@api/axios.config';
import type {
  TemplateTicket,
  CrearTemplateDto,
  ActualizarTemplateDto,
} from '@dto/template.types';

const BASE_URL = '/templates';

export const templatesService = {
  listar: async (): Promise<TemplateTicket[]> => {
    const { data } = await api.get<TemplateTicket[]>(BASE_URL);
    return data;
  },

  obtenerPorModo: async (modo: string): Promise<TemplateTicket> => {
    const { data } = await api.get<TemplateTicket>(`${BASE_URL}/${modo}`);
    return data;
  },

  crear: async (dto: CrearTemplateDto): Promise<TemplateTicket> => {
    const { data } = await api.post<TemplateTicket>(BASE_URL, dto);
    return data;
  },

  actualizar: async (
    id: string,
    dto: ActualizarTemplateDto,
  ): Promise<TemplateTicket> => {
    const { data } = await api.put<TemplateTicket>(`${BASE_URL}/${id}`, dto);
    return data;
  },

  guardarOActualizar: async (
    modo: string,
    dto: CrearTemplateDto,
  ): Promise<TemplateTicket> => {
    const { data } = await api.put<TemplateTicket>(
      `${BASE_URL}/guardar/${modo}`,
      dto,
    );
    return data;
  },
};