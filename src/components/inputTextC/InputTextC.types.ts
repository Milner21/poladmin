import type { ChangeEvent, ReactNode } from "react";

export interface InputTextCProps {
  label: string;
  name: string;
  placeholder?: string;
  prefix?: ReactNode;
  type?: "text" | "password" | "email" | "number" | "tel" | "url";
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  showCount?: boolean;
  allowClear?: boolean;
  size?: "small" | "middle" | "large";
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}