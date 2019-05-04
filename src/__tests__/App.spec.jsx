// Integration tests for pacs-react
import React from 'react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import * as R from 'ramda';
import { mount } from 'enzyme';
import App, { makeLink, makeRoute, makeRouter } from '../App';
import TransactionTable from '../components/TransactionTable';
import CurrencyTable from '../components/CurrencyTable';
import AccountTree from '../components/AccountTree';
import { AccountFactory, CurrencyFactory, TransactionFactory } from '../testUtils';
import TransactionForm from '../components/TransactionForm';
import AccountForm from '../components/AccountForm';
import EditTransactionComponent from '../components/EditTransactionComponent';

/**
  * Uses enzyme to mount App.
  * @param {Object} opts - Possible options.
  * @param {Object[]} opts.transactions - An array of transactions to be showed as
  *    the recent transactions.
  * @param {number} opts.timeout - A delay for the promise that retrieves the
  *    recent transactions.
  * @param {Function} opts.createAcc - A function called to create an account
  *    (parsed to AccountForm).
  * @param {Function} opts.createTransaction - A function called to create a
  *    transaction.
  * @param {Function} opts.getAccounts - A mock function called to get a list
  *    of all accounts.
  * @param {Function} opts.getCurrencies - A mock function called to get a list
  *    of all currencies.
  */
function mountApp(opts) {
  const {
    transactions=[],
    timeout=0,
    createAcc=(() => {}),
    createTransaction=(() => {}),
    getAccounts=(() => Promise.resolve([])),
    getCurrencies=(() => Promise.resolve([]))
  } = opts || {};

  // Prepares a function that returns transactions when called
  const getTransactions = () => new Promise(resolve => {
    setTimeout(() => resolve(transactions), timeout);
  });

  return mount(
    <App
      getTransactions={getTransactions}
      getAccounts={getAccounts}
      getCurrencies={getCurrencies}
      createAcc={createAcc}
      createTransaction={createTransaction} />
  );
}


describe('App.test.jsx', () => {

  describe('makeLink()', () => {
    it('base', () => {
      const path = "/some/path";
      const text = "Some Text";
      const routeData = {path, text};

      const exp = (<li key={path}><Link to={path}>{text}</Link></li>);

      expect(makeLink(routeData)).toEqual(exp);
    });
  });

  describe('makeRoute()', () => {
    it('base', () => {
      const path = "/a/b";
      const component = () => (<h1>Hola</h1>);

      const exp = (<Route key={path} path={path} component={component} />);

      expect(makeRoute({path, component})).toEqual(exp);
    });
  });

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
    });
  });

  describe('Retrieving accounts list...', () => {
    it('Retrieves accounts when mounted', () => {
      expect.assertions(1);

      const accounts = [AccountFactory.buildRoot()];
      const accountsPromise = Promise.resolve(accounts);
      const getAccounts = () => accountsPromise;
      const app = mountApp({getAccounts});
      const promiseToWaitFor = Promise.all([
        accountsPromise,
        app.busy
      ]);

      return promiseToWaitFor.then(() => {
        app.update();
        app.instance().forceUpdate();
        expect(app.state().accounts).toBe(accounts);
      });
    });
  });

  describe('renderTransactionTable', () => {
    it('Still loading', () => {
      const resp = App.renderTransactionTable(null, [], []);
      expect(resp).toEqual(<p>Loading...</p>);
    });
    it('Still loading if currencies not loaded', () => {
      const resp = App.renderTransactionTable([], null, []);
      expect(resp).toEqual(<p>Loading...</p>);
    });
    it('Still loading if accounts not loaded', () => {
      const resp = App.renderTransactionTable([], [], undefined);
      expect(resp).toEqual(<p>Loading...</p>);
    });
    it('Finished loading', () => {
      const transactions = TransactionFactory.buildList(3);
      const movements = R.flatten(R.map(R.prop("movements"), transactions));
      const currenciesPks = R.pipe(
        R.map(R.path(["money", "currency"])),
        R.uniq
      )(movements);
      const currencies = R.map(pk => CurrencyFactory.build({pk}), currenciesPks);
      const accountsPks = R.map(R.prop("account"), movements);
      const accounts = R.map(pk => AccountFactory.build({pk}), accountsPks);
      const resp = mount(App.renderTransactionTable(
        transactions,
        currencies,
        accounts
      ));
      const transTable = resp.find(TransactionTable);

      expect(transTable).toHaveLength(1);
      expect(transTable.props().title).toBe("Recent Transactions");
      expect(transTable.props().transactions).toEqual(transactions);
      expect(transTable.props().getCurrency).not.toBe(undefined);
      expect(transTable.props().getCurrency(currencies[0].pk))
        .toEqual(currencies[0]);
    });
  });

  describe('Entire App rendering', () => {

    it('Mounts with a Router object', () => {
      const app = mountApp();
      expect(app.find(Router)).toHaveLength(1);
    });

    it('Router has all entires for app.getRoutesData()', () => {
      const app = mountApp();
      for (var i=0; i<app.instance().getRoutesData({}).length; i++) {
        const routeData = app.instance().getRoutesData({})[i];
        expect(app.find(`Link[to="${routeData.path}"]`)).toHaveLength(1);
        expect(app.find(`Route[path="${routeData.path}"]`)).toHaveLength(1);
      }
    });
  });

  describe('App.renderAccountTree', () => {

    it('Shows loading if accounts is null', () => {
      const accountTree = mount(App.renderAccountTree(null));
      expect(accountTree.equals(<p>Loading...</p>)).toBe(true);
    });

    it('Shows accounts if parsed', () => {
      const accounts = AccountFactory.buildRootAndChildren(2);
      const accountTree = mount(App.renderAccountTree(accounts));
      const exp = <AccountTree accounts={accounts} />;
      expect(accountTree.equals(exp)).toBe(true);
    });
    
  });

  describe('App.renderCreateTransactionComponent...', () => {

    it('Loading while accounts is null...', () => {
      const form = mount(
        App.renderCreateTransactionComponent(null, [], ()=>{})
      );
      expect(form.equals(<p>Loading...</p>)).toBe(true);
    });
    it('Loading while accounts is null...', () => {
      const form = mount(
        App.renderCreateTransactionComponent([], null, ()=>{})
      );
      expect(form.equals(<p>Loading...</p>)).toBe(true);
    });
    it('Rendered when accounts and currencies are not null....', () => {
      const accounts = AccountFactory.buildList(3);
      const currencies = CurrencyFactory.buildList(2);
      const form = mount(
        App.renderCreateTransactionComponent(accounts, currencies, ()=>{})
      );
      expect(form.find(TransactionForm).props().accounts).toEqual(accounts);
      expect(form.find(TransactionForm).props().currencies)
        .toEqual(currencies);
    });
  });

  describe('App.renderCreateAccountComponent...', () => {
    it('Loading while accounts is null...', () => {
      const form = mount(App.renderCreateAccountComponent(null));
      expect(form.equals(<p>Loading...</p>)).toBe(true);
    });
    it('Rendered when accounts is not null...', () => {
      const accounts = AccountFactory.buildList(2);
      const form = mount(App.renderCreateAccountComponent(accounts, ()=>{}));
      expect(form.find(AccountForm)).toHaveLength(1);
      expect(form.find(AccountForm).props().accounts).toEqual(accounts);
    });
  });

  describe('App.renderCurrencyTable...', () => {
    it('Loading while currencies is null...', () => {
      const table = mount(App.renderCurrencyTable());
      expect(table.equals(<p>Loading...</p>)).toBe(true);
    });
    it('Rendered when currencies not null...', () => {
      const currencies = CurrencyFactory.buildList(3);
      const table = mount(App.renderCurrencyTable(currencies));
      expect(table.find(CurrencyTable)).toHaveLength(1);
      expect(table.find(CurrencyTable).props().currencies).toEqual(currencies);
    });
  });

  describe('App.renderEditTransactionComponent', () => {
    it('Loading while currencies is null...', () => {
      const component = mount(App.renderEditTransactionComponent(
        ()=>{},
        ()=>{},
        null,
        []
      ));
      expect(component).toMatchElement(<p>Loading...</p>);
    });
    it('Loading while accounts is null...', () => {
      const component = mount(App.renderEditTransactionComponent(
        ()=>{},
        ()=>{},
        [],
        null
      ));
      expect(component).toMatchElement(<p>Loading...</p>);
    });
    it('Renders when both not null', () => {
      const component = mount(App.renderEditTransactionComponent(
        ()=>{},
        ()=>{},
        [],
        [],
      ));
      expect(component).toContainMatchingElement(EditTransactionComponent);
    });
  });

});
