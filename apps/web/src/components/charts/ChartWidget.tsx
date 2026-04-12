"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

interface ChartWidgetProps {
  chartType: "bar" | "line" | "pie" | "table" | string;
  config: any;
  data: any[];
}

const COLORS = ['#0078D4', '#50E6FF', '#0ea65b', '#f0a30a', '#8b5cf6', '#ec4899'];

export const ChartWidget: React.FC<ChartWidgetProps> = ({ chartType, config, data }) => {
  if (!data || data.length === 0) {
    return <div className="p-4 text-[#9d9d9d] text-sm italic">No data returned for this query.</div>;
  }

  // Bar Chart
  if (chartType === "bar") {
    return (
      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey={config.xAxisKey || Object.keys(data[0])[0]} stroke="#6d6d6d" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#6d6d6d" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "#252529", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px" }}
              itemStyle={{ color: "#f3f3f3" }}
            />
            <Bar dataKey={config.yAxisKey || Object.keys(data[0])[1]} fill={config.color || COLORS[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Line Chart
  if (chartType === "line") {
    return (
      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey={config.xAxisKey || Object.keys(data[0])[0]} stroke="#6d6d6d" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#6d6d6d" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "#252529", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px" }}
              itemStyle={{ color: "#f3f3f3" }}
            />
            <Line type="monotone" dataKey={config.yAxisKey || Object.keys(data[0])[1]} stroke={config.color || COLORS[1]} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Pie Chart
  if (chartType === "pie") {
    
    return (
      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey={config.valueKey || Object.keys(data[0])[1]}
              nameKey={config.nameKey || Object.keys(data[0])[0]}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
              itemStyle={{ color: "#f8fafc" }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Default to Table view if chartType is table or unrecognized
  const keys = Object.keys(data[0]);
  return (
    <div className="mt-4 w-full overflow-x-auto rounded-md" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
      <table className="w-full text-sm text-left text-[#cccccc]">
        <thead className="text-xs uppercase text-[#9d9d9d]" style={{ background: '#1b1b1f' }}>
          <tr>
            {keys.map((key) => (
              <th key={key} scope="col" className="px-6 py-3 font-semibold">
                {key.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b transition-colors hover:bg-[rgba(255,255,255,0.02)]" style={{ background: '#252529', borderColor: 'rgba(255,255,255,0.04)' }}>
              {keys.map((key) => (
                <td key={key} className="px-6 py-4">
                  {typeof row[key] === 'object' ? JSON.stringify(row[key]) : String(row[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
