import type { FC } from "react";

interface AppLogoAdaptiveProps {
  width?: number;
  height?: number;
  className?: string;
  variant?: 'default' | 'sidebar' | 'header';
  animated?: boolean;
}

export const AppLogoAdaptive: FC<AppLogoAdaptiveProps> = ({ 
  width = 60, 
  height = 60,
  className = "",
  variant = 'default',
  animated = false
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'sidebar':
        return 'logo-sidebar';
      case 'header':
        return 'logo-header';
      default:
        return 'logo-adaptive';
    }
  };

  const combinedClasses = [
    getVariantClasses(),
    animated ? 'logo-animated' : '',
    'transition-all duration-200',
    className
  ].filter(Boolean).join(' ');

  return (
    <svg 
      viewBox="0 0 940 940" 
      width={width} 
      height={height}
      className={combinedClasses}
      role="img"
      aria-label="Poladmin Logo"
    >
      <title>Logo Poladmin</title>
      
      {/* Fondo base */}
      <circle 
        cx="470" 
        cy="470" 
        r="450" 
        fill="currentColor" 
        opacity="0.05"
      />
      
      {/* Anillos concéntricos */}
      <circle 
        cx="470" 
        cy="470" 
        r="380" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="20"
        opacity="0.1"
      />
      <circle 
        cx="470" 
        cy="470" 
        r="320" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="15"
        opacity="0.15"
      />
      
      {/* Círculo principal */}
      <circle 
        cx="470" 
        cy="470" 
        r="250" 
        fill="currentColor" 
        opacity="0.9"
      />
      
      {/* Forma de rombo para el fondo blanco */}
      <path
        d="M470 220 L720 470 L470 720 L220 470 Z"
        fill="white"
        opacity="0.95"
      />
      
      {/* Texto principal "POL" */}
      <text 
        x="470" 
        y="500" 
        textAnchor="middle" 
        fontSize="140" 
        fontWeight="900" 
        fill="currentColor"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        POL
      </text>
      
      {/* Subtexto */}
      <text 
        x="470" 
        y="570" 
        textAnchor="middle" 
        fontSize="40" 
        fontWeight="600" 
        fill="currentColor"
        fontFamily="system-ui, -apple-system, sans-serif"
        opacity="0.8"
      >
        ADMIN
      </text>
      
      {/* Pequeños puntos decorativos */}
      <circle cx="350" cy="350" r="8" fill="currentColor" opacity="0.3"/>
      <circle cx="590" cy="350" r="8" fill="currentColor" opacity="0.3"/>
      <circle cx="350" cy="590" r="8" fill="currentColor" opacity="0.3"/>
      <circle cx="590" cy="590" r="8" fill="currentColor" opacity="0.3"/>
    </svg>
  );
};

export default AppLogoAdaptive;