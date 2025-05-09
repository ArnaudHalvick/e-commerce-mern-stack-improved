import React from "react";
import "./Table.css";

/**
 * Table subcomponents
 */
const TableHead = ({ children, className = "", ...rest }) => {
  return (
    <thead className={className} {...rest}>
      {children}
    </thead>
  );
};

const TableBody = ({ children, className = "", ...rest }) => {
  return (
    <tbody className={className} {...rest}>
      {children}
    </tbody>
  );
};

const TableRow = ({ children, className = "", isHeader = false, ...rest }) => {
  return (
    <tr
      className={`admin-table-row ${
        isHeader ? "admin-table-header-row" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </tr>
  );
};

const TableCell = ({ children, className = "", isHeader = false, ...rest }) => {
  const Component = isHeader ? "th" : "td";
  return (
    <Component
      className={`admin-table-cell ${
        isHeader ? "admin-table-header-cell" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
};

/**
 * Table component
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Table content
 * @param {boolean} [props.striped=false] - Whether to use striped rows
 * @param {boolean} [props.hoverable=true] - Whether rows should highlight on hover
 * @param {boolean} [props.bordered=false] - Whether to show borders around cells
 * @param {boolean} [props.responsive=true] - Whether table should be responsive
 * @param {string} [props.className] - Additional CSS classes
 */
const Table = ({
  children,
  striped = false,
  hoverable = true,
  bordered = false,
  responsive = true,
  className = "",
  ...rest
}) => {
  const tableClass = `
    admin-table 
    ${striped ? "admin-table-striped" : ""} 
    ${hoverable ? "admin-table-hover" : ""} 
    ${bordered ? "admin-table-bordered" : ""} 
    ${className}
  `;

  const table = (
    <table className={tableClass} {...rest}>
      {children}
    </table>
  );

  if (responsive) {
    return <div className="admin-table-responsive">{table}</div>;
  }

  return table;
};

// Attach subcomponents
Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;

export default Table;
