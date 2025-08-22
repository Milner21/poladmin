import type { Rule } from "antd/es/form";

/**
 * Construye las reglas de validación para el input
 * @param rules - Reglas personalizadas
 * @param required - Si el campo es requerido
 * @param requiredMessage - Mensaje personalizado para campo requerido
 * @param label - Label del campo para mensaje automático
 * @returns Array de reglas de validación
 */
export const buildInputRules = (
  rules: Rule[] = [],
  required: boolean = false,
  requiredMessage?: string,
  label?: string
): Rule[] => {
  const inputRules: Rule[] = [...rules];

  if (required) {
    inputRules.push({
      required: true,
      message: requiredMessage || `¡Por favor ingrese ${label?.toLowerCase()}!`,
    });
  }

  return inputRules;
};

/**
 * Determina si el input debe ser de tipo password
 * @param type - Tipo del input
 * @returns true si es password
 */
export const isPasswordType = (type?: string): boolean => {
  return type === "password";
};

/**
 * Obtiene las props comunes para los inputs
 * @param props - Props del componente
 * @returns Props comunes para Input e Input.Password
 */
export const getCommonInputProps = (props: {
  prefix?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  showCount?: boolean;
  allowClear?: boolean;
  size?: "small" | "middle" | "large";
}) => {
  const {
    prefix,
    placeholder,
    disabled,
    maxLength,
    showCount,
    allowClear,
    size,
  } = props;

  return {
    prefix,
    placeholder,
    disabled,
    maxLength,
    showCount,
    allowClear,
    size,
  };
};