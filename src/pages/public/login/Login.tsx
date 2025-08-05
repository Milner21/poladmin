import { type FC } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, message, notification } from "antd";
import { Content, Footer } from "antd/es/layout/layout";
import style from "./Login.module.css";
import { useAuthActions } from "@hooks/useAuthAction";
import type { LoginFormValues } from "@interfaces/LoginTypes";
import { useLocation, useNavigate } from "react-router";

const Login: FC = () => {
  const { login, loading, error } = useAuthActions();
  const [messageApi, contextHolder] = message.useMessage();
  const key = "loginMessage";
  const navigate = useNavigate();
  const location = useLocation();

  // Si no hay ruta previa, por defecto va a dashboard
  const from =
    (location.state as { from?: Location })?.from?.pathname || "/test";

  const onFinish = async (values: LoginFormValues) => {
    // Mostrar mensaje de loading
    messageApi.open({
      key,
      type: "loading",
      content: "Autenticando...",
      duration: 0, // duración 0 para que no desaparezca automáticamente
    });

    const success = await login(values.username, values.password);

    if (success) {
      // Actualizar mensaje a éxito
      messageApi.open({
        key,
        type: "success",
        content: "Inicio de sesión exitoso",
        duration: 2,
      });
      // Se redirige al usuario a la ruta previa o dashboard
      navigate(from, { replace: true });
    } else {
      // Cierra el mensaje loading antes de mostrar la notificación
      messageApi.destroy();

      if (error === "Invalid login credentials") {
        notification.error({
          message: "Error de autenticación",
          description:
            "Credenciales inválidas. Por favor, verifica tu usuario y contraseña.",
          duration: 3,
        });
      } else {
        notification.error({
          message: "Error",
          description: error || "Error en el inicio de sesión",
          duration: 3,
        });
      }
    }
  };

  return (
    <>
      {contextHolder}
      <Content style={{ padding: 0, margin: 0 }}>
        <div className={style.loginContent}>
          <div className={style.loginFormContainer}>
            <h4>Poladmin</h4>
            <Form
              className={style.loginForm}
              name="login"
              layout="vertical"
              initialValues={{ remember: true }}
              onFinish={onFinish}
            >
              <Form.Item
                label="Usuario"
                name="username"
                rules={[
                  {
                    required: true,
                    message: "¡Por favor ingrese su nombre de usuario!",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="nombre.apellido"
                />
              </Form.Item>
              <Form.Item
                label="Contraseña"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "¡Por favor ingrese su contraseña!",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                  visibilityToggle={true}
                />
              </Form.Item>
              <Form.Item>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Recordar</Checkbox>
                  </Form.Item>
                  <a href="">Has olvidado tu contraseña</a>
                </div>
              </Form.Item>
              <Form.Item>
                <Button
                  block
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  disabled={loading}
                >
                  Iniciar sesión
                </Button>
              </Form.Item>
            </Form>
            <Footer style={{ textAlign: "center" }}>
              Poladmin ©{new Date().getFullYear()} Created by SITEC
            </Footer>
          </div>
        </div>
      </Content>
    </>
  );
};

export default Login;
