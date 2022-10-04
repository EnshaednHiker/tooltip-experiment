import { TableRowProps } from "./types";

export const TableRow = ({ index, category, headline }: TableRowProps) => {
  const dataTooltip = `category: ${category}, headline: ${headline}`;

  return (
    <tr>
      <td
        aria-describedby={dataTooltip}
        data-tooltip={dataTooltip}
        data-row={index}
      >
        {index + 1}
      </td>
      <td
        aria-describedby={dataTooltip}
        data-tooltip={dataTooltip}
        data-row={index}
      >
        {category}
      </td>
      <td
        aria-describedby={dataTooltip}
        data-tooltip={dataTooltip}
        data-row={index}
      >
        {headline}
      </td>
    </tr>
  );
};

TableRow.displayName = "TableRow";
