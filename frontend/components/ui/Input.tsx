import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export function Input({
  label,
  leftIcon,
  rightSlot,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputClasses = [
    "es-input",
    leftIcon ? "has-left-icon" : "",
    rightSlot ? "has-right-slot" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const field = (
    <div className="es-input-wrapper">
      {leftIcon && <span className="es-input-icon-left">{leftIcon}</span>}
      <input id={id} className={inputClasses} {...props} />
      {rightSlot && <span className="es-input-slot-right">{rightSlot}</span>}
    </div>
  );

  if (!label) return field;

  return (
    <label className="es-field" htmlFor={id}>
      <span className="es-label">{label}</span>
      {field}
    </label>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
}

export function Select({
  label,
  options,
  className = "",
  id,
  ...props
}: SelectProps) {
  const selectEl = (
    <select id={id} className={`es-select ${className}`.trim()} {...props}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );

  if (!label) return selectEl;

  return (
    <label className="es-field" htmlFor={id}>
      <span className="es-label">{label}</span>
      {selectEl}
    </label>
  );
}

