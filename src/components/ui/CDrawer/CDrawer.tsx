import { useEffect, type FC, type ReactNode } from 'react';

interface CDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  placement?: 'left' | 'right';
}

export const CDrawer: FC<CDrawerProps> = ({
  open,
  onClose,
  children,
  width = 250,
  placement = 'left',
}) => {
  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`
          fixed top-0 ${placement === 'left' ? 'left-0' : 'right-0'} 
          h-full bg-bg-sidebar z-50
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : placement === 'left' ? '-translate-x-full' : 'translate-x-full'}
        `}
        style={{ width: `${width}px` }}
      >
        {children}
      </div>
    </>
  );
};