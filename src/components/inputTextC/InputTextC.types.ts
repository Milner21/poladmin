import type { Rule } from "antd/es/form";
import type { ReactNode } from "react";

export interface InputTextCProps {
  label: string;
  name: string;
  placeholder?: string;
  prefix?: ReactNode;
  type?: "text" | "password" | "email" | "number" | "tel" | "url";
  rules?: Rule[];
  required?: boolean;
  requiredMessage?: string;
  disabled?: boolean;
  maxLength?: number;
  showCount?: boolean;
  allowClear?: boolean;
  size?: "small" | "middle" | "large";
}

export type InputType = InputTextCProps["type"];