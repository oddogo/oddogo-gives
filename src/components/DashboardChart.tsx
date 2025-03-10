import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Allocation } from "@/types/allocation";

export const COLORS = [
  '#8B5CF6', // Purple
  '#D946EF', // Pink
  '#F97316', // Orange
  '#0EA5E9', // Blue
  '#14B8A6', // Teal
  '#F43F5E', // Red
];

interface DashboardChartProps {
  data: Allocation[];
  hoveredIndex: number | null;
  onHoverChange: (index: number | null) => void;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-black/90 backdrop-blur-lg px-4 py-2 rounded-lg border border-white/10">
        <p className="text-white font-medium">{data.name}</p>
        <p className="text-gray-300 text-sm">{data.type}</p>
        <p className="text-white font-bold">{(data.value).toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

export const DashboardChart = ({ data, hoveredIndex, onHoverChange }: DashboardChartProps) => {
  const chartData = data.map(allocation => ({
    name: allocation.allocation_name,
    value: allocation.allocation_percentage * 100,
    type: allocation.allocation_type
  }));

  return (
    <div className="relative w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            innerRadius="70%"
            outerRadius="90%"
            paddingAngle={4}
            dataKey="value"
            nameKey="name"
            startAngle={90}
            endAngle={-270}
            onMouseEnter={(_, index) => onHoverChange(index)}
            onMouseLeave={() => onHoverChange(null)}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                strokeWidth={hoveredIndex === index ? 2 : 0}
                stroke={hoveredIndex === index ? "#F1F0FB" : undefined}
                style={{
                  filter: hoveredIndex === index ? 'brightness(1.1)' : 'none',
                  opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.5,
                  transition: 'all 0.2s ease-in-out',
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
