import type { FC } from "react";

const CFooter: FC = () => {
  return (
    <footer className="block text-center bg-transparent py-4 text-text-primary text-sm">
      Poladmin ©{new Date().getFullYear()} Created by <span className="font-semibold">SITEC</span>
    </footer>
  );
};

export default CFooter;