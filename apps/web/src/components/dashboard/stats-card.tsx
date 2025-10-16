'use client';

interface StatsCardProps {
  stat: {
    name: string;
    value: number | string;
    unit?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    change: string;
    changeType: string;
  };
}

export function StatsCard({ stat }: StatsCardProps) {
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    danger: 'bg-danger-500',
    warning: 'bg-warning-500',
  };

  return (
    <div className="card p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`p-3 rounded-lg ${colorClasses[stat.color] || 'bg-gray-500'}`}>
            <stat.icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {stat.name}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {stat.value}{stat.unit}
              </div>
              <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                stat.changeType === 'positive' ? 'text-success-600' : 'text-danger-600'
              }`}>
                {stat.change}
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
