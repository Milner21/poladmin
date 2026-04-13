//src/components/CTable/components/CTableSortIcon.tsx

import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import type { SortDirection } from "../CTable.types";
import type { FC } from "react";

interface SortIconProps {
  isActive: boolean;
  direction: SortDirection;
  isMobile: boolean;
}

export const CTableSortIcon: FC<SortIconProps> = ({
  isActive,
  direction,
  isMobile,
}) => {
  const iconSize = isMobile ? 14 : 16;

  if (isActive && direction === "asc") {
    return <ChevronUp size={iconSize} />;
  }
  if (isActive && direction === "desc") {
    return <ChevronDown size={iconSize} />;
  }
  return <ChevronsUpDown size={iconSize} className="opacity-40" />;
};