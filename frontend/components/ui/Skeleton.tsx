import React from "react";

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export function Skeleton({
  width = "100%",
  height = "1rem",
  borderRadius,
  className = "",
}: SkeletonProps) {
  return (
    <div
      className={`es-skeleton ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius,
      }}
      aria-hidden="true"
    />
  );
}

