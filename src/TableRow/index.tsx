import React from 'react';
import './index.css';
import { TableRowProps } from './types';
export const TableRow = ({ index, category, headline }: TableRowProps) => (<tr className="tableRow"><td>{index + 1}</td><td>{category}</td><td>{headline}</td></tr>);

TableRow.displayName = 'TableRow';