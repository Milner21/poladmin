import type { FC } from "react";
import { CSpinner } from "@components/ui";

const Loading: FC = () => {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/30 flex items-center justify-center z-9999">
      <div className="min-w-75 max-w-175 w-[90vw] bg-bg-content rounded-lg shadow-lg p-8">
        {/* Spinner y texto */}
        <div className="flex flex-col items-center gap-6">
          <CSpinner size="large" />
          <span className="text-2xl font-bold text-text-primary">Cargando...</span>
        </div>

        {/* Skeleton Lines */}
        <div className="mt-6 space-y-3 animate-pulse">
          <div className="h-4 bg-bg-base rounded w-full"></div>
          <div className="h-4 bg-bg-base rounded w-5/6"></div>
          <div className="h-4 bg-bg-base rounded w-4/6"></div>
          <div className="h-4 bg-bg-base rounded w-full"></div>
          <div className="h-4 bg-bg-base rounded w-3/4"></div>
          <div className="h-4 bg-bg-base rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;