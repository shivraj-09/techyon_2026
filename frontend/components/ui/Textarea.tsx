import React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({
  label,
  hint,
  error,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const errorId = id && error ? `${id}-error` : undefined;
  const hintId = id && hint && !error ? `${id}-hint` : undefined;
  const describedBy = props["aria-describedby"] ?? errorId ?? hintId;

  const textareaEl = (
    <textarea
      id={id}
      className={`es-textarea ${error ? "is-error" : ""} ${className}`.trim()}
      aria-invalid={error ? true : props["aria-invalid"]}
      aria-describedby={describedBy}
      {...props}
    />
  );

  if (!label && !hint && !error) return textareaEl;

  return (
    <div className="es-field">
      {label && (
        <label className="es-label" htmlFor={id}>
          {label}
        </label>
      )}
      {textareaEl}
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

