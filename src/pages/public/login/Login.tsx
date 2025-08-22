import { type FC } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Form } from "antd";
import { useLocation, useNavigate } from "react-router";

import { InputTextC, ThemeToggleSwitch } from "@components";
import { useAuthActions } from "@hooks/useAuthAction";
import type { LoginFormValues } from "@interfaces/LoginTypes";
import { useLoginMessages } from "./hooks/useLoginMessages";
import {
  LoginContainer,
  LoginTitle,
  HelpLink,
  FooterContainer,
  LoginForm,
  LoginFormContainer,
  Submit,
  Img,
} from "./Login.styles";
import { LOGIN_CONSTANTS } from "./Login.constants";
import logo from "@assets/AppLogo60px.svg";

const Login: FC = () => {
  const { login, loading, error } = useAuthActions();
  const {
    showLoadingMessage,
    showSuccessMessage,
    showErrorMessage,
    showHelpMessage,
    contextHolder,
  } = useLoginMessages();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as { from?: Location })?.from?.pathname ||
    LOGIN_CONSTANTS.DEFAULT_REDIRECT;

  const handleFinish = async (values: LoginFormValues) => {
    showLoadingMessage();

    const success = await login(values.username, values.password);

    if (success) {
      showSuccessMessage();
      navigate(from, { replace: true });
    } else {
      showErrorMessage(error ?? undefined);
    }
  };

  const handleHelpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    showHelpMessage();
  };

  return (
    <>
      {contextHolder}
      <LoginContainer>
        <LoginFormContainer>
          <Img
              src={logo}
              alt="Poladmin Logo"
            />
          <LoginTitle>Poladmin</LoginTitle>
          <LoginForm>
            <Form
              name="login"
              layout="vertical"
              initialValues={{ remember: true }}
              onFinish={handleFinish}
            >
              <InputTextC
                label="Usuario"
                name="username"
                rules={LOGIN_CONSTANTS.USERNAME_RULES}
                placeholder="nombre.apellido"
                prefix={<UserOutlined />}
                type="text"
              />

              <InputTextC
                label="Contraseña"
                name="password"
                rules={LOGIN_CONSTANTS.PASSWORD_RULES}
                placeholder="4111555"
                prefix={<LockOutlined />}
                type="password"
              />

              <Submit
                block
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={loading}
              >
                Iniciar sesión
              </Submit>

              <Form.Item>
                <HelpLink href="" onClick={handleHelpClick}>
                  ¿Has olvidado tu contraseña?
                </HelpLink>
              </Form.Item>
            </Form>
          </LoginForm>
          <FooterContainer>
            Poladmin ©{new Date().getFullYear()} Created by SITEC
          </FooterContainer>
        </LoginFormContainer>
      </LoginContainer>
      <ThemeToggleSwitch />
    </>
  );
};

export default Login;
