import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  hint?: string;
  error?: string;
}

export function Input({
  label,
  leftIcon,
  rightSlot,
  hint,
  error,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputClasses = [
    "es-input",
    leftIcon ? "has-left-icon" : "",
    rightSlot ? "has-right-slot" : "",
    error ? "is-error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const errorId = id && error ? `${id}-error` : undefined;
  const hintId = id && hint && !error ? `${id}-hint` : undefined;
  const describedBy = props["aria-describedby"] ?? errorId ?? hintId;

  const field = (
    <div className="es-input-wrapper">
      {leftIcon && <span className="es-input-icon-left">{leftIcon}</span>}
      <input
        id={id}
        className={inputClasses}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={describedBy}
        {...props}
      />
      {rightSlot && <span className="es-input-slot-right">{rightSlot}</span>}
    </div>
  );

  if (!label && !hint && !error) return field;

  return (
    <div className="es-field">
      {label && (
        <label className="es-label" htmlFor={id}>
          {label}
        </label>
      )}
      {field}
      {error && (
        <span id={errorId} className="es-field-error" role="alert">
          {error}
        </span>
      )}
      {!error && hint && (
        <span id={hintId} className="es-field-hint">
          {hint}
        </span>
      )}
    </div>
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
  hint?: string;
  error?: string;
}

export function Select({
  label,
  options,
  hint,
  error,
  className = "",
  id,
  ...props
}: SelectProps) {
  const errorId = id && error ? `${id}-error` : undefined;
  const hintId = id && hint && !error ? `${id}-hint` : undefined;
  const describedBy = props["aria-describedby"] ?? errorId ?? hintId;

  const selectEl = (
    <select
      id={id}
      className={`es-select ${error ? "is-error" : ""} ${className}`.trim()}
      aria-invalid={error ? true : props["aria-invalid"]}
      aria-describedby={describedBy}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );

  if (!label && !hint && !error) return selectEl;

  return (
    <div className="es-field">
      {label && (
        <label className="es-label" htmlFor={id}>
          {label}
        </label>
      )}
      {selectEl}
      {error && (
        <span id={errorId} className="es-field-error" role="alert">
          {error}
        </span>
      )}
      {!error && hint && (
        <span id={hintId} className="es-field-hint">
          {hint}
        </span>
      )}
    </div>
  );
}

