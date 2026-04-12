"use client";

import React from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ChartWidgetProps {
  data: any[];
  type: 'bar' | 'line';
  xAxisKey: string;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ data, type, xAxisKey }) => {
  const dataKeys = data.length > 0 ? Object.keys(data[0]).filter(key => key !== xAxisKey) : [];
  const colors = ["#0078D4", "#50E6FF", "#0ea65b", "#f0a30a", "#d13438"];

  return (
    <div className="w-full h-[300px] neo-border rounded-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey={xAxisKey} stroke="#6d6d6d" fontSize={11} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="#6d6d6d" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#252529', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#cccccc', fontSize: '12px' }} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Legend wrapperStyle={{ paddingTop: "16px", fontSize: "11px", color: '#9d9d9d' }} />
            {dataKeys.map((key, idx) => (
              <Bar key={key} dataKey={key} fill={colors[idx % colors.length]} radius={[4, 4, 0, 0]} maxBarSize={50} />
            ))}
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey={xAxisKey} stroke="#6d6d6d" fontSize={11} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="#6d6d6d" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#252529', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#cccccc', fontSize: '12px' }} />
            <Legend wrapperStyle={{ paddingTop: "16px", fontSize: "11px", color: '#9d9d9d' }} />
            {dataKeys.map((key, idx) => (
              <Line key={key} type="monotone" dataKey={key} stroke={colors[idx % colors.length]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
