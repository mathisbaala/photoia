"use client";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  color?: "purple" | "blue" | "green" | "pink" | "orange";
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  color = "purple",
}: StatCardProps) {
  const colorClasses = {
    purple: {
      bg: "from-purple-500 to-purple-600",
      text: "text-purple-600",
      light: "bg-purple-50",
    },
    blue: {
      bg: "from-blue-500 to-blue-600",
      text: "text-blue-600",
      light: "bg-blue-50",
    },
    green: {
      bg: "from-green-500 to-green-600",
      text: "text-green-600",
      light: "bg-green-50",
    },
    pink: {
      bg: "from-pink-500 to-pink-600",
      text: "text-pink-600",
      light: "bg-pink-50",
    },
    orange: {
      bg: "from-orange-500 to-orange-600",
      text: "text-orange-600",
      light: "bg-orange-50",
    },
  };

  const colors = colorClasses[color];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        {/* Icon */}
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colors.bg} shadow-md`}>
          <span className="text-3xl">{icon}</span>
        </div>

        {/* Trend */}
        {trend && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              trend.isPositive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <span>{trend.isPositive ? "↑" : "↓"}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <div className={`text-3xl font-bold ${colors.text}`}>{value}</div>
        {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
      </div>

      {/* Title */}
      <div className="text-sm font-medium text-gray-600">{title}</div>
    </div>
  );
}
