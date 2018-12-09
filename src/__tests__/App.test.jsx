// Integration tests for pacs-react
import React from 'react';
import { mount } from 'enzyme';
import App from '../App';
import TransactionTable from '../components/TransactionTable'

function mountApp(opts) {
  // Mounts the app for testing purposes
  // opts:
  //   transactions: transactions to use on mocked ajax call.
  //                 Defaults to [].
  //   timeout: time to wait for the mocked ajax to resolve.
  //            Defaults to 0.
  const { transactions=[], timeout } = opts || {}

  // Prepares a function that returns transactions when called
  const getTransactions = () => new Promise(resolve => {
    setTimeout(() => resolve(transactions), 0)
  })
  
  return mount(<App getTransactions={getTransactions} />)
}


describe('App.test.jsx', () => {

  describe('renderTransactionTable', () => {
    it('Still loading', () => {
      const resp = App.renderTransactionTable(null)
      expect(resp).toEqual(<p>Loading...</p>)
    })
    it('Finished loading', () => {
      const transactions = [
        {id: 1, description: "hola"}
      ]
      const resp = App.renderTransactionTable(transactions)
      expect(resp).toEqual(
        <TransactionTable
          title="Recent Transactions"
          transactions={transactions} />
      )
    })
  })
  
  describe('Entire App rendering', () => {

    it('Displays loading until Transactions load', async () => {
      const app = mountApp({ timeout: 1000 });
      expect(app.contains(<p>Loading...</p>)).toBe(true)
      expect(app.find("table")).toHaveLength(0)
      await app.instance().busy
      await app.update()
      expect(app.contains(<p>Loading...</p>)).toBe(false)
      expect(app.find("table")).toHaveLength(1)
    })

    it('Empty list of last Transactions is rendered', async () => {
      // The app is rendered
      const app = mountApp();
      await app.instance().busy
      await app.update()

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

    it('Two-long table of transactions is rendered', async () => {
      // The app is rendered with two transactions
      const transactions = [
        {id: 5, description: "Salary November"},
        {id: 12, description: "Japanese Restaurant!"}
      ]
      const app = await mountApp({ transactions });
      await app.instance().busy
      await app.update();

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
  
})
