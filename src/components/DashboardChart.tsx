import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Allocation } from "@/types/allocation";

export const COLORS = [
  '#40B8B8', // Oddogo Teal
  '#33A3A3', // Slightly darker teal
  '#5ECBCB', // Slightly lighter teal
  '#2D9494', // Darker teal
  '#7AD5D5', // Lighter teal
  '#266B6B', // Darkest teal
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

  const totalPercentage = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="relative w-full h-[300px]">
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center">
          <p className="text-3xl font-bold text-[#40B8B8]">{totalPercentage.toFixed(1)}%</p>
          <p className="text-sm text-gray-400">Total Allocation</p>
        </div>
      </div>

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
                stroke={hoveredIndex === index ? "#40B8B8" : undefined}
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
