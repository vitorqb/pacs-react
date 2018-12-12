import React from 'react';
import { createTitle } from '../utils';


// !!!! TODO -> Add header.
/**
  * A React Component that is a table of transactions
  * @param {string} props.title - The title
  * @param {transaction[]} props.transactions - The transactions to render.
  */
export default function TransactionTable(props) {
  const { transactions = [], title = "" } = props;
  const rows = transactions.map((trans, i) => {
    const formattedDate = trans.date ? trans.date.format() : "";
    return (
      <tr key={i}>
        <td>{trans.pk}</td>
        <td>{trans.description}</td>
        <td>{formattedDate}</td>
      </tr>
    )
  });
  const titleSpan = createTitle(title);

  return (
    <div>
      {titleSpan}
      <table><tbody>{rows}</tbody></table>
    </div>
  )
}
