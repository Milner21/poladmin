import styled from "styled-components";
import { Switch } from "antd";
import { THEME_COLORS } from "@themes/color";
import useTheme from "@hooks/useTheme";

export const FloatingContainer = styled.div`
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background-color: ${() =>
      useTheme().darkMode
        ? THEME_COLORS.dark.backgroundContent
        : THEME_COLORS.light.backgroundContent};
  border-radius: 24px;
  box-shadow: ${() =>
    useTheme().darkMode
      ? "0 4px 12px rgba(0, 0, 0, 0.4)"
      : "0 4px 12px rgba(0, 0, 0, 0.15)"};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${() =>
      useTheme().darkMode
        ? "0 6px 16px rgba(0, 0, 0, 0.5)"
        : "0 6px 16px rgba(0, 0, 0, 0.2)"};
  }
`;

export const StyledSwitch = styled(Switch)`
  &.ant-switch {
    background-color: ${() => (useTheme().darkMode ? "#434343" : "#d9d9d9")};
    &.ant-switch-checked {
      background-color: ${() =>
        useTheme().darkMode
          ? THEME_COLORS.dark.primary
          : THEME_COLORS.light.primary};
    }

    .ant-switch-handle {
      &::before {
        background-color: #ffffff;
      }
    }

    &:focus {
      box-shadow: 0 0 0 2px
        ${() =>
          useTheme().darkMode
            ? `${THEME_COLORS.dark.primary}20`
            : `${THEME_COLORS.light.primary}20`};
    }
  }
`;
