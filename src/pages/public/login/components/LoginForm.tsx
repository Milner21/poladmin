import { InputTextC } from "@components";
import RoutesConfig from "@routes/RoutesConfig";
import axios from "axios";
import { Lock, User } from "lucide-react";
import { useState, type FC, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useLogin } from "../hooks/useLogin";

interface FormValues {
  username: string;
  password: string;
}

interface FormErrors {
  username?: string;
  password?: string;
  global?: string;
}

const LoginForm: FC = () => {
  const navigate = useNavigate();

  const [values, setValues] = useState<FormValues>({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (fields: FormValues): FormErrors => {
    const newErrors: FormErrors = {};

    if (!fields.username.trim()) {
      newErrors.username = "El usuario es requerido";
    }

    if (!fields.password.trim()) {
      newErrors.password = "La contraseña es requerida";
    } else if (fields.password.length < 4) {
      newErrors.password = "La contraseña debe tener al menos 4 caracteres";
    }

    return newErrors;
  };

  const loginMutation = useLogin({
    onSuccess: () => {
      navigate(RoutesConfig.dashboard);
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setErrors((prev) => ({
          ...prev,
          global: error.response?.data.message,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          global: "Error de autenticación",
        }));
      }
    },
  });

  const handleChange =
    (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
      // Limpiar error del campo al escribir
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
      // Limpiar error global al escribir
      if (errors.global) {
        setErrors((prev) => ({ ...prev, global: undefined }));
      }
    };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validate(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    loginMutation.mutate(values);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Error global */}
      {errors.global && (
        <div className="mb-4 px-4 py-3 bg-danger/10 border border-danger/30 rounded-lg">
          <p className="text-danger text-sm text-center m-0">{errors.global}</p>
        </div>
      )}

      <InputTextC
        label="Usuario"
        name="username"
        placeholder="nombre.apellido"
        prefix={<User strokeWidth={1.5} size={20} />}
        type="text"
        required
        disabled={loginMutation.isPending}
        value={values.username}
        onChange={handleChange("username")}
        error={errors.username}
      />

      <InputTextC
        label="Contraseña"
        name="password"
        prefix={<Lock strokeWidth={1.5} size={20} />}
        type="password"
        required
        disabled={loginMutation.isPending}
        value={values.password}
        onChange={handleChange("password")}
        error={errors.password}
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="
          w-full py-2.5 px-4 mt-1 mb-4
          bg-primary hover:bg-primary-hover active:bg-primary-active
          text-white font-medium rounded-lg
          transition-colors duration-200
          disabled:opacity-60 disabled:cursor-not-allowed
          flex items-center justify-center gap-2
        "
      >
        {loginMutation.isPending ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Cargando...
          </>
        ) : (
          "Iniciar sesión"
        )}
      </button>

      {/* Forgot password */}
      <a
        href="#"
        className="block text-center text-primary hover:text-primary-hover font-medium transition-colors"
      >
        ¿Has olvidado tu contraseña?
      </a>
    </form>
  );
};

export default LoginForm;
