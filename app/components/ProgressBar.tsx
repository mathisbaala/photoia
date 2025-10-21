"use client";

import { useState, useEffect } from "react";

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  color?: "purple" | "blue" | "green" | "pink";
}

export default function ProgressBar({
  progress,
  label,
  showPercentage = true,
  color = "purple",
}: ProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const gradientClasses = {
    purple: "from-purple-600 to-pink-600",
    blue: "from-blue-600 to-cyan-600",
    green: "from-green-600 to-emerald-600",
    pink: "from-pink-600 to-rose-600",
  };

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm font-semibold text-gray-900">
              {Math.round(animatedProgress)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar Container */}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        {/* Progress Bar Fill */}
        <div
          className={`h-full bg-gradient-to-r ${gradientClasses[color]} rounded-full transition-all duration-700 ease-out shadow-md`}
          style={{ width: `${animatedProgress}%` }}
        >
          {/* Shimmer Effect */}
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
}

// Ajout de l'animation shimmer dans globals.css sera nécessaire
