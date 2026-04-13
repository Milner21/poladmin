import logo from "@assets/AppLogo60px.svg";
import { CFooter } from "@components";
import type { FC } from "react";
import LoginForm from "./components/LoginForm";

const Login: FC = () => {
  return (
    <div className="w-screen h-screen bg-bg-base flex items-center justify-center p-5">
      <div className="w-full max-w-112.5 mx-auto">
        {/* Logo */}
        <img
          src={logo}
          alt="Poladmin Logo"
          className="block mx-auto mb-4 h-12.5 w-auto"
        />

        {/* Title */}
        <h1 className="text-center text-2xl font-semibold text-text-primary mb-2">
          Poladmin
        </h1>

        {/* Form Card */}
        <div className="bg-bg-content p-10 rounded-2xl shadow-md w-full">
          <LoginForm />
        </div>

        {/* Footer */}
        <CFooter />
      </div>
    </div>
  );
};

export default Login;