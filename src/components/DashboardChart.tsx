import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Allocation } from "@/types/allocation";

const typeColors: Record<string, string> = {
  'Charity': '#FF6384',
  'Subcause': '#36A2EB',
  'Meta': '#FFCE56',
  'Region': '#4BC0C0',
  'DAF': '#9966FF',
  'Spotlight': '#FF9F40',
  'None - Error': '#C9CBCF'
};

export const DashboardChart = ({ data }: { data: Allocation[] }) => {
  const chartData = data.map(allocation => ({
    name: allocation.allocation_name,
    value: allocation.allocation_percentage * 100,
    type: allocation.allocation_type
  }));

  return (
    <div className="w-full h-[400px] bg-white rounded-lg p-4">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={5}
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={typeColors[entry.type] || typeColors['None - Error']} 
              />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
