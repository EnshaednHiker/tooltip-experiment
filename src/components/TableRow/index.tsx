import { TableRowProps } from "./types";

export const TableRow = ({ index, category, headline }: TableRowProps) => {
  const dataTooltip = `category: ${category}, headline: ${headline}`;

  return (
    <tr>
      <td data-tooltip={dataTooltip} data-row={index}>
        {index + 1}
      </td>
      <td data-tooltip={dataTooltip} data-row={index}>
        {category}
      </td>
      <td data-tooltip={dataTooltip} data-row={index}>
        {headline}
      </td>
    </tr>
  );
};

TableRow.displayName = "TableRow";
