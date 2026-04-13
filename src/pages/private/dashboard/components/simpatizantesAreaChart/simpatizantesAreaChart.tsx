import useTheme from "@hooks/useTheme";
import type { FC, ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DataItem {
  dia: string;
  dia_inicio: string;
  dia_fin: string;
  total: number;
  dia_nombre: string;
}

interface Props {
  data: DataItem[];
  title: string;
}

export const SimpatizantesAreaChart: FC<Props> = ({ data, title }) => {
  const { darkMode } = useTheme();

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      value?: string | number;
      name?: string;
      dataKey?: string;
      color?: string;
    }>;
    label?: string | number;
  }): ReactNode => {
    if (
      active &&
      payload &&
      payload.length &&
      payload[0]?.value !== undefined &&
      label !== undefined
    ) {
      return (
        <div className="
          bg-bg-content border border-border rounded-lg
          shadow-sm px-3 py-2
        ">
          <p className="m-0 text-text-primary text-sm">
            {`Registros del ${label}`}
          </p>
          <hr className={`my-1 border-border`} />
          <p className="m-0 text-text-primary text-sm">
            {`En total: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="
      w-full h-full bg-bg-content border border-border
      rounded-lg shadow-sm p-3 box-border
      text-text-primary
    ">
      {title && (
        <h4 className="text-xl font-semibold mb-1 w-full text-center">
          {title}
        </h4>
      )}
      <h6 className={`text-center text-text-tertiary m-0 mb-2 text-sm font-normal`}>
        Los datos en pantalla corresponden a los últimos 7 días
      </h6>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 20, left: -27, bottom: 50 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={darkMode ? "#1e293b" : "#e5e7eb"} 
          />
          <XAxis 
            dataKey="dia_nombre"
            stroke={darkMode ? "#94a3b8" : "#6b7280"}
            tick={{ fill: darkMode ? "#94a3b8" : "#6b7280" }}
          />
          <YAxis 
            tickMargin={0}
            stroke={darkMode ? "#94a3b8" : "#6b7280"}
            tick={{ fill: darkMode ? "#94a3b8" : "#6b7280" }}
          />
          <Tooltip content={CustomTooltip} />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#2bd98e"
            fill="#2bd98e20"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};