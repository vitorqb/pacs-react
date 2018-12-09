import React from 'react';
import { createTitle } from '../utils';

// !!!! TODO -> Add date
export default function TransactionTable(props) {
  const { transactions = [], title = "" } = props;
  const rows = transactions.map((trans, i) => {
    return <tr key={i}><td>{trans.id}</td><td>{trans.description}</td></tr>
  });
  const titleSpan = createTitle(title);

  return (
    <div>
      {titleSpan}
      <table><tbody>{rows}</tbody></table>
    </div>
  )
}
