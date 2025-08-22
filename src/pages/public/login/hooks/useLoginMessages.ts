import { message, App } from "antd";
import { LOGIN_CONSTANTS } from "../Login.constants";

export const useLoginMessages = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const { notification: notificationApi } = App.useApp();
  const { MESSAGE_KEY, MESSAGES, NOTIFICATION_DURATION } = LOGIN_CONSTANTS;

  const showLoadingMessage = () => {
    messageApi.open({
      key: MESSAGE_KEY,
      type: "loading",
      content: MESSAGES.LOADING,
      duration: 0,
    });
  };

  const showSuccessMessage = () => {
    messageApi.open({
      key: MESSAGE_KEY,
      type: "success",
      content: MESSAGES.SUCCESS,
      duration: NOTIFICATION_DURATION.SUCCESS,
    });
  };

  const showErrorMessage = (error?: string) => {
    messageApi.destroy();

    if (error === "Invalid login credentials") {
      notificationApi.error({
        message: "Error de autenticación",
        description: MESSAGES.ERROR_INVALID_CREDENTIALS,
        duration: NOTIFICATION_DURATION.ERROR,
      });
    } else {
      notificationApi.error({
        message: "Error",
        description: error || MESSAGES.ERROR_GENERIC,
        duration: NOTIFICATION_DURATION.ERROR,
      });
    }
  };

  const showHelpMessage = () => {
    messageApi.open({
      key: MESSAGE_KEY,
      type: "info",
      content: MESSAGES.HELP,
      duration: NOTIFICATION_DURATION.HELP,
    });
  };

  return {
    showLoadingMessage,
    showSuccessMessage,
    showErrorMessage,
    showHelpMessage,
    contextHolder,
  };
};