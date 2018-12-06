// Integration tests for pacs-react
import React from 'react';
import { mount } from 'enzyme';
import App from '../src/App';
import TransactionTable from '../src/components/TransactionTable'


describe('User first interaction', () => {
  it('List of last Transactions is rendered', () => {
    // The app is rendered
    const app = mount(<App />)

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
})
