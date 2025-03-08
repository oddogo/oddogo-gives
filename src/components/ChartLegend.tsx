
import { AllocationType } from "@/types/allocation";

interface ChartLegendProps {
  data: {
    name: string;
    value: number;
    type: AllocationType;
  }[];
}

const typeColors: Record<string, string> = {
  'Charity': '#FF6384',
  'Subcause': '#36A2EB',
  'Meta': '#FFCE56',
  'Region': '#4BC0C0',
  'DAF': '#9966FF',
  'Spotlight': '#FF9F40',
  'None - Error': '#C9CBCF'
};

export const ChartLegend = ({ data }: ChartLegendProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: typeColors[item.type] }}
          />
          <span className="text-sm">
            {item.name} ({item.value.toFixed(1)}%)
          </span>
        </div>
      ))}
    </div>
  );
};
