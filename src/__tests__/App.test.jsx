// Integration tests for pacs-react
import React from 'react';
import sinon from 'sinon';
import moment from 'moment';
import { mount } from 'enzyme';
import App from '../App';
import TransactionTable from '../components/TransactionTable'
import CreateAccForm from '../components/CreateAccForm';


/**
  * Uses enzyme to mount App.
  * @param {Object} opts - Possible options.
  * @param {Object[]} opts.transactions - An array of transactions to be showed as
  *    the recent transactions.
  * @param {number} opts.timeout - A delay for the promise that retrieves the
  *    recent transactions.
  * @param {Function} opts.createAcc - A function called to create an account
  *    (parsed to CreateAccForm).
  */
function mountApp(opts) {
  const { transactions=[], timeout=0, createAcc=(() => {}) } = opts || {}

  // Prepares a function that returns transactions when called
  const getTransactions = () => new Promise(resolve => {
    setTimeout(() => resolve(transactions), timeout)
  })

  return mount(
    <App getTransactions={getTransactions} createAcc={createAcc} />
  )
}


describe('App.test.jsx', () => {

  describe('renderTransactionTable', () => {
    it('Still loading', () => {
      const resp = App.renderTransactionTable(null)
      expect(resp).toEqual(<p>Loading...</p>)
    })
    it('Finished loading', () => {
      const transactions = [
        {id: 1, description: "hola", date: moment("1993-11-23")}
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
      const title = transactionList.find("span.titleSpan")
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
        {id: 5, description: "Salary November", date: moment("2018-01-01")},
        {id: 12, description: "Japanese Restaurant!", date: moment("1970-01-01")}
      ]
      const app = await mountApp({ transactions });
      await app.instance().busy
      await app.update();

      // Two rows are found
      expect(app.find("tr")).toHaveLength(2);

      // And fours tds
      expect(app.find("td")).toHaveLength(6);

      // And their contents is as expected
      const expectedTds = transactions.reduce((acc, trans) => {
        const { id, description } = trans;
        const date = trans.date.format();
        return [...acc, <td>{id}</td>, <td>{description}</td>, <td>{date}</td>]
      }, [])
      for (var i=0; i < expectedTds.length; i++) {
        const td = expectedTds[i]
        expect(app.find("td").contains(td)).toBe(true)
      }
    })

    it('Create account form is rendered', async () => {
      const app = await mountApp();
      await app.instance().busy
      await app.update()
      expect(app.find(CreateAccForm)).toHaveLength(1)
    })

    it('Submits a create account form', async () => {
      const createAcc = sinon.fake();
      const app = mountApp({ createAcc });
      const accForm = app.find(CreateAccForm)
      const rawAccData = { name: "TestAcc", accType: "Leaf", parent: 1 }

      function setInput(inputName, value) {
        accForm.find({name: inputName}).simulate('change', { target: { value }})
      }

      setInput("name", rawAccData.name)
      setInput("accType", rawAccData.accType)
      setInput("parent", rawAccData.parent)

      accForm.find("form").simulate("submit")

      expect(createAcc.calledOnce).toBe(true)
      const args = createAcc.lastCall.args[1]
      expect(args).toEqual(rawAccData)
    })

  })
  
})
