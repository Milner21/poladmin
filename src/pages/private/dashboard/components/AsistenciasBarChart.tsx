// src/pages/private/dashboard/components/AsistenciasBarChart.tsx

import {type FC } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { AsistenciasPorEvento } from '@dto/dashboard.types';

interface Props {
  data: AsistenciasPorEvento[];
}

export const AsistenciasBarChart: FC<Props> = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="evento_nombre" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="total_asistencias" fill="#52c41a" />
    </BarChart>
  </ResponsiveContainer>
);