'use client';

interface MetricsCardProps {
  title: string;
  value: number;
  percentage: string;
  icon: React.ReactNode;
  iconColor: string;
  hasInfoIcon?: boolean;
  hasFilters?: boolean;
}

export default function MetricsCard({ 
  title, 
  value, 
  percentage, 
  icon, 
  iconColor, 
  hasInfoIcon = true,
  hasFilters = false
}: MetricsCardProps) {
  return (
    <div className="bg-[#2a2d35] border border-[#3a3d45] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${iconColor} rounded-full flex items-center justify-center`}>
            {icon}
          </div>
          <h3 className="text-gray-300 text-sm font-medium">{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          {hasFilters && (
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
          )}
          {hasInfoIcon && (
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
      </div>
      <div className="text-white text-3xl font-bold mb-2">{value}</div>
      <div className="text-red-400 text-sm">↓ {percentage}</div>
    </div>
  );
}
