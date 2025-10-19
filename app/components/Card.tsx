"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  gradient?: boolean;
  className?: string;
}

export function Card({
  children,
  hover = false,
  padding = "md",
  gradient = false,
  className = "",
}: CardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const baseClasses = `
    bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300
    ${hover ? "hover:shadow-2xl hover:-translate-y-1" : ""}
    ${gradient ? "border-2 border-transparent bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30" : ""}
    ${paddingClasses[padding]}
    ${className}
  `;

  return <div className={baseClasses}>{children}</div>;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: string;
}

export function CardHeader({ title, subtitle, action, icon }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          {icon && <span className="text-2xl">{icon}</span>}
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div className={`mt-6 pt-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

interface CardSectionProps {
  children: ReactNode;
  className?: string;
}

export function CardSection({ children, className = "" }: CardSectionProps) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}
