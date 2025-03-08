
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Allocation } from "@/types/allocation";

const COLORS = ['#00B8D9', '#36B37E', '#FF5630', '#6554C0', '#FFAB00', '#FF7452'];

export const DashboardChart = ({ data }: { data: Allocation[] }) => {
  const chartData = data.map(allocation => ({
    name: allocation.allocation_name,
    value: allocation.allocation_percentage * 100,
    type: allocation.allocation_type
  }));

  return (
    <div className="w-full h-full">
      <ResponsiveContainer>
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
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                strokeWidth={0}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
