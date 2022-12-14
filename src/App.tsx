import React from "react";

import "./App.css";

import { TABLE_DATA } from "./data/tableData";
import { TableRow } from "./components/TableRow";
import { TooltipController } from "./components/TooltipController";

function App() {
  return (
    <div className="page-wrapper">
      <TooltipController>
        <table>
          <thead>
            <tr>
              <th>number</th>
              <th>category</th>
              <th>headline</th>
            </tr>
          </thead>
          <tbody>
            {TABLE_DATA.map((tableDatum, index) => (
              <TableRow
                index={index}
                category={tableDatum.category}
                headline={tableDatum.mostPopularArticle}
                key={`${tableDatum.category}-${index}`}
              />
            ))}
          </tbody>
        </table>
      </TooltipController>
    </div>
  );
}

export default App;
