import styled from "styled-components";
import { Button, Space } from "antd";
import { THEME_COLORS } from "@themes/color";
import useTheme from "@hooks/useTheme";

export const LoginContainer = styled(Space)`
  background-color: ${() =>
    useTheme().darkMode
      ? THEME_COLORS.dark.backgoundBase
      : THEME_COLORS.light.backgoundBase};
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

export const LoginFormContainer = styled.div`
  width: 100%;
  max-width: 450px;
  margin: auto;

  @media (min-width: 1024px) {
    min-width: 450px;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    padding: 0;
  }
`;

export const LoginForm = styled.div`
  background-color: ${() =>
    useTheme().darkMode
      ? THEME_COLORS.dark.backgroundContent
      : THEME_COLORS.light.backgroundContent};
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const LoginTitle = styled.h1`
  text-align: center;
  margin-bottom: 10px;
  font-size: 24px;
  font-weight: 600;
  color: ${() =>
    useTheme().darkMode ? THEME_COLORS.dark.text : THEME_COLORS.light.text};
`;

export const Img = styled.img`
  display: block; 
  margin: 0 auto 16px auto;
  height: 50px; 
  width: auto;
`;

export const Submit = styled(Button)`
  font-weight: 500;
  margin-bottom: 5px;
`;

export const HelpLink = styled.a`
  color: ${() =>
    useTheme().darkMode
      ? THEME_COLORS.dark.primary
      : THEME_COLORS.light.primary};
  font-weight: 500;
  display: block;
  text-align: center;
  &:hover {
    text-decoration: underline;
    color: ${() =>
    useTheme().darkMode
      ? THEME_COLORS.dark.primary
      : THEME_COLORS.light.primary};
  }
  &:active {
    color: ${() =>
    useTheme().darkMode
      ? THEME_COLORS.dark.linkActive
      : THEME_COLORS.light.linkActive};
  }
  @media (min-width: 1024px) {
    text-align: left;
  }
  
`;

export const FooterContainer = styled.div`
  text-align: center;
  padding: 16px 0;
  margin-top: auto;
  border-radius: 0 0 8px 8px;
  font-size: 12px;
  color: ${() =>
    useTheme().darkMode ? THEME_COLORS.dark.text : THEME_COLORS.light.text};
`;
