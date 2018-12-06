import React from 'react';

export default function TransactionList(props) {
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
