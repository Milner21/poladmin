// src/utils/telefono.ts

/**
 * Formatea un numero de telefono de Paraguay para visualizacion.
 * Entrada esperada: "0981123456"
 * Salida: "0981 123 456"
 * Si tiene otro formato o longitud, retorna el texto original o un guion si es vacio.
 */
export function formatearTelefono(telefono?: string | null): string {
  if (!telefono || !telefono.trim()) return "-";

  const digitos = telefono.replace(/\D/g, "");

  // Celulares de 10 digitos: 09XXXXXXXX -> 09XX XXX XXX
  if (/^09\d{8}$/.test(digitos)) {
    return `${digitos.slice(0, 4)} ${digitos.slice(4, 7)} ${digitos.slice(7)}`;
  }

  // Celulares de 9 digitos sin cero: 9XXXXXXXX -> 09XX XXX XXX
  if (/^9\d{8}$/.test(digitos)) {
    return `0${digitos.slice(0, 3)} ${digitos.slice(3, 6)} ${digitos.slice(6)}`;
  }

  // Formato internacional: 5959XXXXXXXX -> 09XX XXX XXX
  if (/^5959\d{8}$/.test(digitos)) {
    const sinPrefijo = digitos.slice(3); // 9XXXXXXXX
    return `0${sinPrefijo.slice(0, 3)} ${sinPrefijo.slice(3, 6)} ${sinPrefijo.slice(6)}`;
  }

  // Telefonos fijos de 9 digitos: 021XXXXXX -> 021 XXX XXX
  if (/^021\d{6}$/.test(digitos)) {
    return `${digitos.slice(0, 3)} ${digitos.slice(3, 6)} ${digitos.slice(6)}`;
  }

  return telefono;
}