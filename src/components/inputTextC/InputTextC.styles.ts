import { Form } from "antd";
import styled from "styled-components";
import { THEME_COLORS } from "@themes/color";

export const StyledFormItem = styled(Form.Item)<{ $darkMode: boolean }>`
  &:focus-within .customLabel {
    color: ${(props) =>
      props.$darkMode ? THEME_COLORS.dark.primary : THEME_COLORS.light.primary};
  }
  &:focus-within .ant-input-prefix .anticon {
    color: ${(props) =>
      props.$darkMode ? THEME_COLORS.dark.primary : THEME_COLORS.light.primary};
  }

  margin-bottom: 15px;

  .customLabel {
    font-weight: 500;
    font-size: 14px;
    transition: color 0.2s ease;
  }
`;
