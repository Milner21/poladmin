// src/pages/private/templates/hooks/useDetectarOverflow.ts

import { useState, useEffect, useRef } from 'react';

interface ResultadoOverflow {
  ref: React.RefObject<HTMLDivElement | null>;
  tieneOverflow: boolean;
}

export function useDetectarOverflow(
  dependencias: unknown[],
): ResultadoOverflow {
  const ref = useRef<HTMLDivElement | null>(null);
  const [tieneOverflow, setTieneOverflow] = useState<boolean>(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      setTieneOverflow(false);
      return;
    }

    const overflow =
      el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;

    setTieneOverflow(overflow);
  }, dependencias);

  return { ref, tieneOverflow };
}