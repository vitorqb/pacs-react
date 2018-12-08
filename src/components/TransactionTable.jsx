import React from 'react';

// !!!! TODO -> Add date
export default function TransactionTable(props) {
  const { transactions = [] } = props
  const rows = transactions.map((trans, i) => {
    return <tr key={i}><td>{trans.id}</td><td>{trans.description}</td></tr>
  })
  return (
    <div>
      <span className="title">{props.title}</span>
      <table><tbody>{rows}</tbody></table>
    </div>
  )
}
