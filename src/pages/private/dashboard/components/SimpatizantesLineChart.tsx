// src/pages/private/dashboard/components/SimpatizantesLineChart.tsx

import { type FC } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis,
} from 'recharts';

interface DataItem {
  dia: string; // o Date si lo conviertes
  dia_inicio: string;
  dia_fin: string;
  total: number;
  // Agregamos la propiedad necesaria para el gráfico
  dia_nombre: string;
}

interface Props {
  data: DataItem[];
}

export const SimpatizantesLineChart: FC<Props> = ({ data }) => {
  const transformedData = data.map(item => ({
    ...item,
    dia_nombre: item.dia,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={transformedData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="dia_nombre" /> {/* Ahora `dia_nombre` existe */}
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="total" stroke="#1890ff" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};