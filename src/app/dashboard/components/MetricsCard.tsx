'use client';

interface MetricsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: string;
}

export default function MetricsCard({ title, value, change, changeType, icon }: MetricsCardProps) {
  return (
    <div className="bg-[#2a2d35] rounded-lg border border-[#3a3d45] p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-white text-2xl font-bold">{value}</p>
        </div>
        <div className="w-12 h-12 bg-[#1a1d23] rounded-lg flex items-center justify-center">
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
      <div className="mt-4">
        <span className={`text-sm font-medium ${
          changeType === 'positive' ? 'text-[#00b894]' : 'text-red-500'
        }`}>
          {change}
        </span>
        <span className="text-gray-400 text-sm ml-1">desde el mes pasado</span>
      </div>
    </div>
  );
}
