
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Allocation } from "@/types/allocation";

export const COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9', '#14B8A6', '#F43F5E'];

interface DashboardChartProps {
  data: Allocation[];
  hoveredIndex: number | null;
  onHoverChange: (index: number | null) => void;
}

export const DashboardChart = ({ data, hoveredIndex, onHoverChange }: DashboardChartProps) => {
  const chartData = data.map(allocation => ({
    name: allocation.allocation_name,
    value: allocation.allocation_percentage * 100,
    type: allocation.allocation_type
  }));

  return (
    <div className="w-full h-[300px] bg-white rounded-lg p-4 text-black">
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
                }}
              />
            ))}
          </Pie>
          {/* Separate layer for labels to ensure they're always visible */}
          <Pie
            data={chartData}
            innerRadius="70%"
            outerRadius="90%"
            paddingAngle={4}
            dataKey="value"
            nameKey="name"
            startAngle={90}
            endAngle={-270}
            fill="none"
            stroke="none"
            label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
              const RADIAN = Math.PI / 180;
              const radius = 25 + innerRadius + (outerRadius - innerRadius);
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);

              return (
                <text
                  x={x}
                  y={y}
                  fill={COLORS[index % COLORS.length]}
                  textAnchor={x > cx ? 'start' : 'end'}
                  dominantBaseline="central"
                  className="font-semibold select-none pointer-events-none"
                >
                  {`${value.toFixed(0)}%`}
                </text>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
