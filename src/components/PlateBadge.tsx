interface PlateBadgeProps {
  plate: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const PlateBadge = ({ plate, size = "md", className = "" }: PlateBadgeProps) => {
  const sizeClass = size === "sm" ? "plate-badge-sm" : size === "lg" ? "plate-badge-lg" : "plate-badge";
  return (
    <span className={`${sizeClass} ${className}`}>
      <span className="text-[0.5em] leading-none">🇧🇷</span>
      {plate}
    </span>
  );
};

export default PlateBadge;
