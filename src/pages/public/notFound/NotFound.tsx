//src/pages/public/notFound/NotFound.tsx

import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen w-screen bg-bg-base px-5">
      <div className="flex flex-col items-center text-center max-w-md">
        
        {/* 404 Number */}
        <h1 className="text-[120px] font-bold text-primary leading-none m-0">
          404
        </h1>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-text-primary mt-2 mb-3">
          Página no encontrada
        </h2>

        {/* Subtitle */}
        <p className="text-text-secondary text-base mb-8">
          Lo sentimos, la página que estás buscando no existe o fue movida.
        </p>

        {/* Buttons */}
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => navigate(-1)}
            className="
              flex items-center gap-2 px-5 py-2.5
              border border-border rounded-lg
              text-text-primary hover:bg-bg-content
              transition-colors text-sm font-medium
            "
          >
            <ArrowLeft size={16} />
            Regresar Atrás
          </button>

          <button
            onClick={() => navigate("/")}
            className="
              flex items-center gap-2 px-5 py-2.5
              bg-primary hover:bg-primary-hover
              text-white rounded-lg
              transition-colors text-sm font-medium
            "
          >
            <Home size={16} />
            Ir al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;