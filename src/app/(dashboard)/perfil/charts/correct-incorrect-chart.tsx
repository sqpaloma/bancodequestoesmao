'use client';

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface CorrectIncorrectChartProps {
  correctCount: number;
  incorrectCount: number;
}

export function CorrectIncorrectChart({
  correctCount,
  incorrectCount,
}: CorrectIncorrectChartProps) {
  const data = [
    { name: 'Corretas', value: correctCount, color: '#2563eb' }, // Darker blue
    { name: 'Incorretas', value: incorrectCount, color: '#60a5fa' }, // Medium blue
  ];

  return (
    <div className="bg-card text-card-foreground rounded-lg border p-3 shadow-sm">
      <div className="mb-2">
        <h3 className="text-md font-semibold">Desempenho em Respostas</h3>
        <p className="text-muted-foreground text-xs">Corretas vs Incorretas</p>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={60}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={value => [`${value} questões`, '']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
