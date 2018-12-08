// Integration tests for pacs-react
import React from 'react';
import { mount } from 'enzyme';
import App from '../src/App';
import TransactionTable from '../src/components/TransactionTable'


function mountApp(opts) {
  const { transactions=[] } = opts || {}
  return mount(<App transactions={transactions} />)
}


describe('User first interaction', () => {
  it('Empty list of last Transactions is rendered', () => {
    // The app is rendered
    const app = mountApp()

    // A transaction list with title Recent Transactions is shown
    const transactionList = app.find(TransactionTable)
    expect(transactionList).toHaveLength(1)
    const title = transactionList.find("span.title")
    expect(title.html()).toContain("Recent Transactions")

    // The table has no entries!
    const table = transactionList.find('table')
    expect(table).toHaveLength(1)
    expect(table.find('td')).toHaveLength(0)
    expect(table.find('tr')).toHaveLength(0)
  })
  it('Two-long table of transactions is rendered', () => {
    // The app is rendered with two transactions
    const transactions = [
      {id: 5, description: "Salary November"},
      {id: 12, description: "Japanese Restaurant!"}
    ]
    const app = mountApp({ transactions })

    // Two rows are found
    expect(app.find("tr")).toHaveLength(2);

    // And fours tds
    expect(app.find("td")).toHaveLength(4);

    // And their contents is as expected
    const expectedTds = transactions.reduce((acc, trans) => {
      const { id, description } = trans
      return [...acc, <td>{id}</td>, <td>{description}</td>]
    }, [])
    for (var i=0; i < expectedTds.length; i++) {
      const td = expectedTds[i]
      expect(app.find("td").contains(td)).toBe(true)
    }
  })
})
