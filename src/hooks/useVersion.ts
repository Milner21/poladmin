import { useEffect, useState } from 'react';

export const useVersion = (): string | null => {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    const obtener = async () => {
      try {
        const response = await fetch(`/version.json?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (!response.ok) return;
        const data = await response.json();
        setVersion(data.version as string);
      } catch {
        // Silenciar error
      }
    };
    void obtener();
  }, []);

  return version;
};