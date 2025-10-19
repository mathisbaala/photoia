"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "error" | "warning" | "info" | "purple" | "pink";
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  size = "md",
  pulse = false,
  className = "",
}: BadgeProps) {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800 border-gray-200",
    success: "bg-green-100 text-green-800 border-green-200",
    error: "bg-red-100 text-red-800 border-red-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    pink: "bg-pink-100 text-pink-800 border-pink-200",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full border-2
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${pulse ? "animate-pulse" : ""}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
