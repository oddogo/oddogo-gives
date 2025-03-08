
import { AllocationType } from "@/types/allocation";

interface ChartLegendProps {
  data: {
    name: string;
    value: number;
    type: AllocationType;
  }[];
}

export const ChartLegend = ({ data }: ChartLegendProps) => {
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={`https://api.dicebear.com/7.x/shapes/svg?seed=${item.name}`} 
              alt={item.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-gray-900">{item.name}</span>
          </div>
          <span className="font-semibold">{item.value.toFixed(0)}%</span>
        </div>
      ))}
    </div>
  );
};
