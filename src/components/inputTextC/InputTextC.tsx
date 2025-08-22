import { Input } from "antd";
import useTheme from "@hooks/useTheme";
import type { FC } from "react";
//importaciones locales
import type { InputTextCProps } from "./InputTextC.types";
import { StyledFormItem } from "./InputTextC.styles";
import { buildInputRules, isPasswordType, getCommonInputProps } from "./InputTextC.utils";

const InputTextC: FC<InputTextCProps> = ({
  label,
  name,
  placeholder,
  prefix,
  type = "text",
  rules,
  required = false,
  requiredMessage,
  disabled = false,
  maxLength,
  showCount = false,
  allowClear = false,
  size = "middle",
}) => {
  const { darkMode } = useTheme();

  // Construir reglas de validación
  const inputRules = buildInputRules(rules, required, requiredMessage, label);

  // Props comunes para ambos tipos de input
  const commonProps = getCommonInputProps({
    prefix,
    placeholder,
    disabled,
    maxLength,
    showCount,
    allowClear,
    size,
  });

  // Renderizar el input apropiado según el tipo
  const renderInput = () => {
    if (isPasswordType(type)) {
      return (
        <Input.Password
          {...commonProps}
          visibilityToggle={true}
        />
      );
    }

    return <Input {...commonProps} type={type} />;
  };

  return (
    <StyledFormItem
      $darkMode={darkMode}
      label={<span className="customLabel">{label}</span>}
      name={name}
      rules={inputRules}
    >
      {renderInput()}
    </StyledFormItem>
  );
};

export default InputTextC;