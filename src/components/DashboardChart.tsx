
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Allocation } from "@/types/allocation";

export const COLORS = ['#D3E4FD', '#F2FCE2', '#FEF7CD', '#E5DEFF', '#FEC6A1', '#FFDEE2'];

export const DashboardChart = ({ data }: { data: Allocation[] }) => {
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
