// Integration tests for pacs-react
import * as R from 'ramda';
import React from 'react';
import sinon from 'sinon';
import moment from 'moment';
import { mount } from 'enzyme';
import App from '../App';
import TransactionTable from '../components/TransactionTable';
import CreateAccForm from '../components/CreateAccForm';
import CreateTransactionForm from '../components/CreateTransactionForm';
import MovementInputs from '../components/MovementInputs';
import axiosWrapper from '../ajax';

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
  const {
    transactions=[],
    timeout=0,
    createAcc=(() => {}),
    createTransaction=(() => {})
  } = opts || {}

  // Prepares a function that returns transactions when called
  const getTransactions = () => new Promise(resolve => {
    setTimeout(() => resolve(transactions), timeout)
  })

  return mount(
    <App
      getTransactions={getTransactions}
      createAcc={createAcc}
      createTransaction={createTransaction} />
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
        {pk: 1, description: "hola", date: moment("1993-11-23")}
      ]
      const resp = App.renderTransactionTable(transactions)
      expect(resp).toEqual(
        <div className="TransactionTableDiv">
          <TransactionTable
            title="Recent Transactions"
            transactions={transactions} />
        </div>
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
        {pk: 5, description: "Salary November", date: moment("2018-01-01")},
        {pk: 12, description: "Japanese Restaurant!", date: moment("1970-01-01")}
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
        const { pk, description } = trans;
        const date = trans.date.format("YYYY-MM-DD");
        return [...acc, <td>{pk}</td>, <td>{description}</td>, <td>{date}</td>]
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
      const createAcc = sinon.fake.resolves();
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
      const args = createAcc.lastCall.args[0]
      expect(args).toEqual(rawAccData)
    })

  })

  describe('createTransactionForm', () => {
    it('Creating a transaction...', () => {
      const createTransaction = sinon.fake.resolves();
      const app = mountApp({createTransaction: createTransaction});
      const createTransactionForm = app.find(CreateTransactionForm).find("form");
      const description = "alojsda";
      const date =  "1993-11-23";
      const movements = [
        {account: 12, quantity: 32, currency: 55},
        {account: 11, quantity: -32, currency: 55}
      ]

      createTransactionForm.find('input[name="description"]').simulate(
        "change",
        { target: { value: description } }
      )
      createTransactionForm.find('input[name="date"]').simulate(
        "change",
        { target: { value: date } }
      )

      const movementsInputs = app.find(MovementInputs);
      const inputNames = ["account", "quantity", "currency"]
      for (var i=0; i<movements.length; i++) {
        for (var j=0; j<inputNames.length; j++) {
          movementsInputs.at(i).find(`input[name="${inputNames[j]}"]`).simulate(
            "change",
            { target: { value: movements[i][inputNames[j]] } }
          )
        }
      }

      createTransactionForm.simulate("submit");

      expect(createTransaction.calledWith({description, date, movements}))
        .toBe(true)
    })
  })
  
})
