// src/pages/private/templates/utils/comprimirImagen.ts

const ANCHO_MAXIMO_PX = 400;
const CALIDAD_JPEG = 0.75;

export function comprimirImagen(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (eventoLectura) => {
      const srcOriginal = eventoLectura.target?.result;
      if (typeof srcOriginal !== 'string') {
        reject(new Error('No se pudo leer el archivo'));
        return;
      }

      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');

        let ancho = img.width;
        let alto = img.height;

        // Redimensionar si es mas ancho que el maximo
        if (ancho > ANCHO_MAXIMO_PX) {
          const factor = ANCHO_MAXIMO_PX / ancho;
          ancho = ANCHO_MAXIMO_PX;
          alto = Math.round(alto * factor);
        }

        canvas.width = ancho;
        canvas.height = alto;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener contexto del canvas'));
          return;
        }

        // Fondo blanco antes de dibujar (para PNGs con transparencia)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, ancho, alto);

        ctx.drawImage(img, 0, 0, ancho, alto);

        // Exportar como JPEG con calidad reducida
        const srcComprimido = canvas.toDataURL('image/jpeg', CALIDAD_JPEG);
        resolve(srcComprimido);
      };

      img.onerror = () => {
        reject(new Error('No se pudo cargar la imagen'));
      };

      img.src = srcOriginal;
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsDataURL(archivo);
  });
}