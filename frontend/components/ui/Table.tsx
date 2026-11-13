import React from "react";

export function Table({
  className = "",
  children,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="es-table-container">
      <table className={`es-table ${className}`.trim()} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props}>{children}</thead>;
}

export function TableBody({
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props}>{children}</tbody>;
}

export function TableRow({
  children,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props}>{children}</tr>;
}

export function TableHeaderCell({
  children,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th {...props}>{children}</th>;
}

export function TableCell({
  children,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props}>{children}</td>;
}

