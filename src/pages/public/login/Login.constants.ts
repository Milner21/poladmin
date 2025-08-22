export const LOGIN_CONSTANTS = {
  DEFAULT_REDIRECT: "/test",
  MESSAGE_KEY: "loginMessage",

  USERNAME_RULES: [
    {
      required: true,
      message: "¡Por favor ingrese su nombre de usuario!",
    },
  ],

  PASSWORD_RULES: [
    {
      required: true,
      message: "¡Por favor ingrese su contraseña!",
    },
  ],

  MESSAGES: {
    LOADING: "Autenticando...",
    SUCCESS: "Inicio de sesión exitoso",
    HELP: "Consulte con su administrador para recuperar su contraseña",
    ERROR_INVALID_CREDENTIALS:
      "Credenciales inválidas. Por favor, verifica tu usuario y contraseña.",
    ERROR_GENERIC: "Error en el inicio de sesión",
  },

  NOTIFICATION_DURATION: {
    SUCCESS: 2,
    ERROR: 3,
    HELP: 2,
  },
};
