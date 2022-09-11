import React from 'react';

import './App.css';

import {TABLE_DATA} from './tableData'
import {TableRow}  from './TableRow';

function App() {

  return (
    <table className="">
    <thead><tr><th>number</th><th>category</th><th>headline</th></tr></thead>  
      <tbody>
      {TABLE_DATA.map((tableDatum, index) => <TableRow index={index} category={tableDatum.category} headline={tableDatum.mostPopularArticle} key={`${tableDatum.category}-${index}`}/>)}
      </tbody>
    </table>
  );
}

export default App;
