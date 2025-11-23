"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * PKP Table Component
 * Matches OJS 3.3 table styling exactly
 */
type PkpTableProps = {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function PkpTable({ children, className, style }: PkpTableProps) {
  return (
    <table
      className={cn("pkp_controllers_grid_table", className)}
      style={{
        width: "100%",
        borderCollapse: "collapse",
        tableLayout: "auto",
        minWidth: "100%",
        ...style,
      }}
    >
      {children}
    </table>
  );
}

type PkpTableHeaderProps = {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function PkpTableHeader({ children, className, style }: PkpTableHeaderProps) {
  return (
    <thead
      className={cn(className)}
      style={{
        ...style,
      }}
    >
      {children}
    </thead>
  );
}

type PkpTableRowProps = {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  isHeader?: boolean;
};

export function PkpTableRow({ children, className, style, isHeader = false }: PkpTableRowProps) {
  return (
    <tr
      className={cn(isHeader ? "pkpTableRow--header" : "pkpTableRow", className)}
      style={{
        borderTop: isHeader ? "none" : "1px solid #eee",
        position: "static",
        backgroundColor: "transparent",
        ...style,
      }}
    >
      {children}
    </tr>
  );
}

type PkpTableHeadProps = {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function PkpTableHead({ children, className, style }: PkpTableHeadProps) {
  return (
    <th
      className={cn(className)}
      style={{
        paddingTop: "1rem",
        paddingBottom: "1rem",
        paddingLeft: "2rem", // Safe area padding - lebih besar agar tidak mepet
        paddingRight: "2rem", // Safe area padding - lebih besar agar tidak mepet
        textAlign: "left",
        fontSize: "0.75rem",
        lineHeight: "16px",
        fontWeight: 400,
        color: "rgba(0, 0, 0, 0.54)",
        boxShadow: "inset 0 -1px 0 #eee",
        verticalAlign: "top",
        ...style,
      }}
    >
      {children}
    </th>
  );
}

type PkpTableCellProps = {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function PkpTableCell({ children, className, style }: PkpTableCellProps) {
  return (
    <td
      className={cn(className)}
      style={{
        paddingTop: "1rem",
        paddingBottom: "calc(1rem - 1px)",
        paddingLeft: "2rem", // Safe area padding - lebih besar agar tidak mepet
        paddingRight: "2rem", // Safe area padding - lebih besar agar tidak mepet
        fontSize: "0.875rem",
        color: "rgba(0, 0, 0, 0.84)",
        verticalAlign: "top",
        lineHeight: "1.5rem",
        position: "relative",
        ...style,
      }}
    >
      {children}
    </td>
  );
}

