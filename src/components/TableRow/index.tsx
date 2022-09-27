import { TableRowProps } from "./types";

export const TableRow = ({ index, category, headline }: TableRowProps) => {
  const dataTooltip = `category: ${category}, headline: ${headline}`;

  return (
    <tr>
      <td data-tooltip={dataTooltip}>{index + 1}</td>
      <td data-tooltip={dataTooltip}>{category}</td>
      <td data-tooltip={dataTooltip}>{headline}</td>
    </tr>
  );
};

TableRow.displayName = "TableRow";
