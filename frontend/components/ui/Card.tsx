import React from "react";

export function Card({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`es-card ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`es-card-header ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`es-card-title ${className}`.trim()} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`es-card-description ${className}`.trim()} {...props}>
      {children}
    </p>
  );
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  flush?: boolean;
}

export function CardBody({
  flush = false,
  className = "",
  children,
  ...props
}: CardBodyProps) {
  return (
    <div
      className={`es-card-body ${flush ? "es-card-body-flush" : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`es-card-footer ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export interface StatCardProps {
  label: string;
  value: string | number;
  meta?: React.ReactNode;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, meta, icon }: StatCardProps) {
  return (
    <div className="es-stat-card">
      <div className="es-stat-top">
        <span>{label}</span>
        {icon}
      </div>
      <div className="es-stat-value">{value}</div>
      {meta && <div className="es-stat-meta">{meta}</div>}
    </div>
  );
}
