"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export default function LoadingSpinner({ size = "md", message }: LoadingSpinnerProps) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizes[size]} relative`}>
        {/* Cercle extérieur */}
        <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
        {/* Cercle animé */}
        <div
          className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"
          style={{ animationDuration: "0.8s" }}
        ></div>
        {/* Point central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      {message && (
        <p className="text-gray-600 font-medium animate-pulse">{message}</p>
      )}
    </div>
  );
}

export function LoadingOverlay({ message = "Chargement..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl">
        <LoadingSpinner size="lg" message={message} />
      </div>
    </div>
  );
}
