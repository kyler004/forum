interface SkeletonProps {
  className?: string;
  variant?: "text" | "rectangular" | "circular";
}

export default function Skeleton({
  className = "",
  variant = "text",
}: SkeletonProps) {
  const baseClasses =
    "animate-pulse bg-gray-200 dark:bg-gray-700 rounded transition-colors";

  let variantClasses = "";
  if (variant === "text") variantClasses = "h-4 w-full";
  if (variant === "circular") variantClasses = "rounded-full";

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}></div>
  );
}
