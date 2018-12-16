// Integration tests for pacs-react
import * as R from 'ramda';
import React from 'react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import sinon from 'sinon';
import moment from 'moment';
import { mount } from 'enzyme';
import App, { makeLink, makeRoute, makeRouter } from '../App';
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

  describe('makeLink()', () => {
    it('base', () => {
      const path = "/some/path";
      const text = "Some Text";
      const routeData = {path, text}

      const exp = (<li key={path}><Link to={path}>{text}</Link></li>)

      expect(makeLink(routeData)).toEqual(exp)
    })
  })

  describe('makeRoute()', () => {
    it('base', () => {
      const path = "/a/b";
      const component = () => (<h1>Hola</h1>);

      const exp = (<Route key={path} path={path} component={component} />);

      expect(makeRoute({path, component})).toEqual(exp);
    })
  })

  describe('makeRouter()', () => {
    it('base', () => {
      const path = "/c/d/";
      const text = "A";
      const component = () => (<h1>Hola</h1>);
      const data = { path, text, component };
      const link = makeLink(data);
      const route = makeRoute(data);

      const exp = mount(
        <Router>
          <div>
            <ul>
              {link}
            </ul>
            {route}
          </div>
        </Router>
      );

      const router = mount(makeRouter([data]));
      expect(router.find(Route).equals(route)).toBe(true);
      expect(router.html()).toEqual(exp.html());
    })
  })

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

    it('Mounts with a Router object', () => {
      const app = mountApp();
      expect(app.find(Router)).toHaveLength(1);
    })

    it('Router has all entires for app.getRoutesData()', () => {
      const app = mountApp();
      for (var i=0; i<app.instance().getRoutesData({}).length; i++) {
        const routeData = app.instance().getRoutesData({})[i];
        expect(app.find(`Link[to="${routeData.path}"]`)).toHaveLength(1);
        expect(app.find(`Route[path="${routeData.path}"]`)).toHaveLength(1);
      }
    })
  })  
})
