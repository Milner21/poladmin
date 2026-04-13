import { useState, type FC, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { InputTextCProps } from "./InputTextC.types";

const InputTextC: FC<InputTextCProps> = ({
  label,
  name,
  placeholder,
  prefix,
  type = "text",
  required = false,
  disabled = false,
  maxLength,
  allowClear = false,
  size = "middle",
  value,
  onChange,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  const sizeClasses = {
    small: "px-3 py-1 text-sm",
    middle: "px-4 py-2 text-sm",
    large: "px-4 py-3 text-base",
  };

  return (
    <div className="mb-4">
      {/* Label */}
      <label
        htmlFor={name}
        className={`
          block text-sm font-medium mb-1 transition-colors duration-200
          ${isFocused ? "text-primary" : "text-text-primary"}
        `}
      >
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>

      {/* Input Wrapper */}
      <div className={`
        relative flex items-center
        bg-bg-content border rounded-lg overflow-hidden
        transition-all duration-200
        ${isFocused ? "border-primary ring-2 ring-primary/20" : "border-border"}
        ${error ? "border-danger ring-2 ring-danger/20" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed bg-bg-base" : ""}
      `}>
        {/* Prefix Icon */}
        {prefix && (
          <span className={`
            pl-3 flex items-center
            transition-colors duration-200
            ${isFocused ? "text-primary" : "text-text-tertiary"}
          `}>
            {prefix as ReactNode}
          </span>
        )}

        {/* Input */}
        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            flex-1 bg-transparent outline-none
            text-text-primary placeholder:text-text-tertiary
            ${sizeClasses[size]}
            ${prefix ? "pl-2" : ""}
            ${isPassword || allowClear ? "pr-2" : ""}
            ${disabled ? "cursor-not-allowed" : ""}
          `}
        />

        {/* Clear button */}
        {allowClear && value && !disabled && (
          <button
            type="button"
            onClick={() => onChange?.({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>)}
            className="pr-3 text-text-tertiary hover:text-text-primary transition-colors"
          >
            ✕
          </button>
        )}

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="pr-3 text-text-tertiary hover:text-text-primary transition-colors flex items-center"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-danger text-xs mt-1">{error}</p>
      )}

      {/* Max length counter */}
      {maxLength && value && (
        <p className="text-text-tertiary text-xs mt-1 text-right">
          {String(value).length}/{maxLength}
        </p>
      )}
    </div>
  );
};

export default InputTextC;