import type { FC, ReactNode } from "react";
import { RefreshCcw } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showRefresh?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  showDivider?: boolean;
  extraContent?: ReactNode;
  titleLevel?: 1 | 2 | 3 | 4 | 5;
}

const titleClasses = {
  1: "text-4xl",
  2: "text-3xl",
  3: "text-2xl",
  4: "text-xl",
  5: "text-lg",
};

export const PageHeader: FC<PageHeaderProps> = ({
  title,
  subtitle,
  showRefresh = false,
  onRefresh,
  isRefreshing = false,
  showDivider = true,
  extraContent,
  titleLevel = 3,
}) => {
  const renderTitle = () => {
    const className = `${titleClasses[titleLevel]} font-semibold text-text-primary m-0`;
    
    switch (titleLevel) {
      case 1: return <h1 className={className}>{title}</h1>;
      case 2: return <h2 className={className}>{title}</h2>;
      case 3: return <h3 className={className}>{title}</h3>;
      case 4: return <h4 className={className}>{title}</h4>;
      case 5: return <h5 className={className}>{title}</h5>;
      default: return <h3 className={className}>{title}</h3>;
    }
  };

  return (
    <>
      <div className="flex w-full justify-between items-center">
        <div>
          {renderTitle()}
          {subtitle && (
            <p className="text-sm text-text-tertiary m-0 mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {extraContent}
          
          {showRefresh && onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="
                w-10 h-10 rounded-full
                border-none bg-transparent
                text-primary hover:bg-primary/10
                flex items-center justify-center
                transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                group
              "
              title="Actualizar datos"
            >
              <RefreshCcw 
                size={20} 
                className={isRefreshing ? "spin" : "group-hover:rotate-180 transition-transform duration-500"} 
              />
            </button>
          )}
        </div>
      </div>
      
      {showDivider && (
        <hr className="border-t border-border my-4" />
      )}
    </>
  );
};