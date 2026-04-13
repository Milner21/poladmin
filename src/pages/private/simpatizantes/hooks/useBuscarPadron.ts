import { useState } from 'react';
import { simpatizantesService } from '@services/simpatizantes.service';
import type { ResultadoBusquedaInteligente, EncontradoEn } from '@dto/padron.types';

interface PasosBusqueda {
  texto: string;
  completado: boolean;
  encontrado: boolean;
}

interface EstadoBusqueda {
  buscando: boolean;
  pasos: PasosBusqueda[];
  resultado: ResultadoBusquedaInteligente | null;
  error: string | null;
}

const PASOS_INTERNAS: PasosBusqueda[] = [
  { texto: 'Buscando en simpatizantes...', completado: false, encontrado: false },
  { texto: 'Buscando en padrón interno...', completado: false, encontrado: false },
  { texto: 'Buscando en padrón general...', completado: false, encontrado: false },
];

const PASOS_GENERALES: PasosBusqueda[] = [
  { texto: 'Buscando en simpatizantes...', completado: false, encontrado: false },
  { texto: 'Buscando en padrón general...', completado: false, encontrado: false },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useBuscarPadron = () => {
  const [estado, setEstado] = useState<EstadoBusqueda>({
    buscando: false,
    pasos: [],
    resultado: null,
    error: null,
  });

  const buscar = async (ci: string): Promise<ResultadoBusquedaInteligente | null> => {
    setEstado({ buscando: true, pasos: PASOS_INTERNAS, resultado: null, error: null });

    let resultado: ResultadoBusquedaInteligente;

    try {
      resultado = await simpatizantesService.busquedaInteligente(ci);
    } catch {
      setEstado((prev) => ({
        ...prev,
        buscando: false,
        error: 'Error al realizar la búsqueda',
      }));
      return null;
    }

    const encontradoEn: EncontradoEn = resultado.encontrado_en;

    const usaInternas =
      encontradoEn === 'PADRON_INTERNO' ||
      encontradoEn === 'NO_ENCONTRADO';

    const pasos = usaInternas ? [...PASOS_INTERNAS] : [...PASOS_GENERALES];

    setEstado({ buscando: true, pasos, resultado: null, error: null });

    await delay(400);

    if (encontradoEn === 'SIMPATIZANTE') {
      setEstado({
        buscando: false,
        pasos: pasos.map((p, i) =>
          i === 0 ? { ...p, completado: true, encontrado: true } : p,
        ),
        resultado,
        error: null,
      });
      return resultado;
    }

    setEstado((prev) => ({
      ...prev,
      pasos: prev.pasos.map((p, i) =>
        i === 0 ? { ...p, completado: true, encontrado: false } : p,
      ),
    }));

    await delay(400);

    if (usaInternas) {
      if (encontradoEn === 'PADRON_INTERNO') {
        setEstado((prev) => ({
          ...prev,
          pasos: prev.pasos.map((p, i) =>
            i === 1 ? { ...p, completado: true, encontrado: true } : p,
          ),
          buscando: false,
          resultado,
        }));
        return resultado;
      }

      setEstado((prev) => ({
        ...prev,
        pasos: prev.pasos.map((p, i) =>
          i === 1 ? { ...p, completado: true, encontrado: false } : p,
        ),
      }));

      await delay(400);
    }

    const indicePadronGeneral = usaInternas ? 2 : 1;

    if (encontradoEn === 'PADRON_GENERAL') {
      setEstado((prev) => ({
        ...prev,
        pasos: prev.pasos.map((p, i) =>
          i === indicePadronGeneral ? { ...p, completado: true, encontrado: true } : p,
        ),
        buscando: false,
        resultado,
      }));
      return resultado;
    }

    setEstado((prev) => ({
      ...prev,
      pasos: prev.pasos.map((p, i) =>
        i === indicePadronGeneral ? { ...p, completado: true, encontrado: false } : p,
      ),
      buscando: false,
      resultado,
    }));

    return resultado;
  };

  const resetear = () => {
    setEstado({ buscando: false, pasos: [], resultado: null, error: null });
  };

  return {
    buscar,
    resetear,
    buscando: estado.buscando,
    pasos: estado.pasos,
    resultado: estado.resultado,
    error: estado.error,
  };
};