import type { FC } from "react";
import { useVersion } from "@hooks/useVersion";

const CFooter: FC = () => {
  const version = useVersion();
  return (
    <footer className="block text-center bg-transparent py-4 text-text-primary text-sm">
      <span>
        Poladmin{" "}
        {version && (
          <span className="text-xs text-text-tertiary">v{version}</span>
        )}{" "}
        © {new Date().getFullYear()} Created by{" "}
        <span className="font-semibold">SITEC</span>
      </span>
    </footer>
  );
};

export default CFooter;
