import * as R from 'ramda';
import React, { Component, createElement } from 'react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import './App.scss';
import * as RU from './ramda-utils';
import TransactionTable from "./components/TransactionTable";
import CurrencyTable from './components/CurrencyTable';
import CreateAccountComponent from './components/CreateAccountComponent.jsx';
import EditAccountComponent from './components/EditAccountComponent.jsx';
import CreateTransactionComponent from './components/CreateTransactionComponent';
import EditTransactionComponent from './components/EditTransactionComponent';
import JournalComponent from './components/JournalComponent.jsx';
import AccountBalanceEvolutionComponent from './components/AccountBalanceEvolutionComponent';
import AccountFlowEvolutionReportComponent from './components/AccountFlowEvolutionReportComponent';
import { defaultColumnMakers } from './components/JournalTable.jsx';
import { mkAxiosWrapper, ajaxGetRecentTransactions, ajaxCreateAcc, ajaxCreateTransaction, ajaxGetAccounts, ajaxGetCurrencies, ajaxUpdateTransaction, ajaxGetTransaction, ajaxUpdateAccount, ajaxGetPaginatedJournalDataForAccount, ajaxGetAccountBalanceEvolutionData, ajaxGetAccountsFlowsEvolutionData } from "./ajax";
import AccountTree from './components/AccountTree';
import { newGetter, isDescendant } from './utils';
import LoginPage, { valueLens as LoginPageLens } from './components/LoginPage';
import secretsLens from './domain/Secrets/Lens';
import * as SecretsValidation from './domain/Secrets/Validation';
import ErrorMessage from './components/ErrorMessage';

/**
 * Makes a Link for a router.
 * @param {Object} linkData - An object with data for the link.
 * @param {string} linkData.path - The path (url).
 * @param {string} linkData.text - The text to display in the link.
 */
export function makeLink({path, text}) {
  return <li key={path}><Link to={path}>{text}</Link></li>;
}

/**
 * Makes a Route for a router.
 * @param {Object} routeData - An object with data for the route.
 * @param {string} routeData.path - The path (url).
 * @param {Function} linkData.component - a 0-arity function returning a
 *   component to render for this route.
 */
export function makeRoute({path, component}) {
  return (<Route key={path} path={path} component={component} />);
}

/**
 * Makes a Router object given a data.
 * @param {Object[]} routerData - An object with data for the router.
 */
export function makeRouter(routerData) {
  const links = R.map(makeLink, routerData);
  const routes = R.map(makeRoute, routerData);
  return (
    <Router>
      <div>
        <ul>
          {links}
        </ul>
        {routes}
      </div>
    </Router>
  );
}

const loginPageValueLens = R.lensPath(['loginPageValue']);

/**
 * View the Secrets from the App state.
 */
const viewSecrets = state => RU.setLenses(
  [[secretsLens.token, R.view(lens.token, state)],
   [secretsLens.host, R.view(lens.host, state)]],
  {},
);

/**
 * Set the Secrets into a satate.
 */
const setSecrets = R.curry((secrets, s) => RU.setLenses(
  [[lens.token, R.view(secretsLens.token, secrets)],
   [lens.host, R.view(secretsLens.host, secrets)]],
  s,
));

const RemoteFetchingStatusEnum = {
  uninitialized: 'UNINITIALIZED',
  loading: 'LOADING',
  finished: 'FINISHED',
};

const lens = {

  // Is the user logged in?
  isLoggedIn: R.lensPath(['isLoggedIn']),

  // The state for the initial remote fetching of options.
  remoteFetchingStatus: R.lensPath(['remoteFetchingStatus']),

  // Errors from the login page
  loginPageErrors: R.lensPath(['loginPageErrors']),

  // Values from the login page.
  loginPageValue: loginPageValueLens,
  host: R.compose(loginPageValueLens, LoginPageLens.host),
  token: R.compose(loginPageValueLens, LoginPageLens.token),
  secrets: R.lens(viewSecrets, setSecrets),

};

class App extends Component {
  // The main application

  // allows external acces to the promise used in componentDidMount,
  // so we can test it.
  busy;

  constructor(props) {
    // Defines the initial state, depending on whether `secrets` have been given as props
    super(props);
    let state = R.set(
      lens.remoteFetchingStatus,
      RemoteFetchingStatusEnum.uninitialized,
      {}
    );
    if (props.secrets) {
      state = RU.setLenses(
        [[lens.secrets, props.secrets], [lens.isLoggedIn, true]],
        state,
      );
    };
    this.state = state;
  }

  /**
   * Returns an axiosWrapper to use, based on the secrets lens of the state.
   */
  getAxiosWrapper = () => mkAxiosWrapper(R.view(lens.secrets, this.state))

  // Setters
  setTransactions = (transactions) => this.setState({transactions})
  setAccounts = (accounts) => this.setState({accounts})
  setCurrencies = (currencies) => this.setState({currencies})

  /**
   * Runs an ajax request to get accounts and set them to the state.
   */
  ajaxGetAccounts = () => {
    const { getAccounts = ajaxGetAccounts } = this.props;
    return getAccounts(this.getAxiosWrapper()).then(this.setAccounts);
  }

  /**
   * Runs an ajax request to get transactions and set them to the state.
   */
  ajaxGetTransactions = () => {
    const { getTransactions = ajaxGetRecentTransactions } = this.props;
    return  getTransactions(this.getAxiosWrapper()).then(this.setTransactions);
  }

  /**
   * Runs an ajax request to get the currencies and set them to the state.
   */
  ajaxGetCurrencies = () => {
    const { getCurrencies = ajaxGetCurrencies } = this.props;
    return getCurrencies(this.getAxiosWrapper()).then(this.setCurrencies);
  }

  /**
   * Fetches all remote data that has to be fetched during initialization.
   * Assumes we have valid secrets stored in the state.
   */
  goFetchRemoteData() {
    // Stores the loading state.
    console.log("HERE");
    this.setState(
      R.set(lens.remoteFetchingStatus, RemoteFetchingStatusEnum.loading)
    );
    
    // Loads transactions, accounts and currencies and sets state on return
    const getTransactionsPromise = this.ajaxGetTransactions();
    const getAccountsPromise = this.ajaxGetAccounts();
    const getCurrenciesPromise = this.ajaxGetCurrencies();
    const allFinished = Promise.all([
      getTransactionsPromise,
      getAccountsPromise,
      getCurrenciesPromise
    ]);
    this.busy = allFinished.then(_ => this.setState(
      R.set(lens.remoteFetchingStatus, RemoteFetchingStatusEnum.finished)
    ));
    return this.busy;
  }

  componentDidMount() {
    // If we are already logged in when we are mounted, fetches the remote info.
    if (R.view(lens.isLoggedIn, this.state)) { return this.goFetchRemoteData(); }
  }

  renderLoginPage() {
    const onLoginPageSubmit = () => {
      const secrets = R.view(lens.secrets, this.state);
      const reducerFn = SecretsValidation.validateSecrets(secrets).cata(
        err => R.set(lens.loginPageErrors, err),
        _ => {
          this.goFetchRemoteData();
          return RU.setLenses([
            [lens.isLoggedIn, true],
            [lens.loginPageErrors, null],
          ]);
        });
      return this.setState(reducerFn);
    };
    const onLoginPageChange = v => this.setState(R.set(lens.loginPageValue, v));
    const loginPageValue = R.view(lens.loginPageValue, this.state);
    return (
      <div className="login-page-wrapper">
        <LoginPage
          onChange={onLoginPageChange}
          onSubmit={onLoginPageSubmit}
          value={loginPageValue}
        />
        <ErrorMessage value={R.view(lens.loginPageErrors, this.state)} />
      </div>
    );
  }

  render() {

    // If we are not logged in, render the log in page
    if (! R.view(lens.isLoggedIn, this.state)) {
      return this.renderLoginPage();
    }

    // If we are logged in but the state is not ready, we are loading...
    const remoteFetchingStatus = R.view(lens.remoteFetchingStatus, this.state);
    if (  remoteFetchingStatus == RemoteFetchingStatusEnum.uninitialized
       || remoteFetchingStatus == RemoteFetchingStatusEnum.loading) {
      return <div>LOADING...</div>;
    }

    // Prepares ajax related functions
    const {
      createAcc = ajaxCreateAcc(this.getAxiosWrapper()),
      updateAcc = ajaxUpdateAccount(this.getAxiosWrapper()),
      createTransaction = ajaxCreateTransaction(this.getAxiosWrapper()),
      updateTransaction = ajaxUpdateTransaction(this.getAxiosWrapper()),
      getTransaction = ajaxGetTransaction(this.getAxiosWrapper()),
      getPaginatedJournalDataForAccount =
        ajaxGetPaginatedJournalDataForAccount(this.getAxiosWrapper()),
      getAccountBalanceEvolutionData =
        ajaxGetAccountBalanceEvolutionData(this.getAxiosWrapper()),
      getAccountsFlowsEvolutionData =
        ajaxGetAccountsFlowsEvolutionData(this.getAxiosWrapper()),
    } = this.props || {};

    // Retrieves from the state
    const { transactions, accounts, currencies } = this.state;

    // Render the components
    const transactionTable = App.renderTransactionTable(
      transactions,
      currencies,
      accounts
    );
    const createAccForm = this.renderCreateAccountComponent(accounts, createAcc);
    const editAccountComponent = App.renderEditAccountComponent(
      accounts,
      updateAcc
    );
    const createTransactionForm = App.renderCreateTransactionComponent(
      accounts,
      currencies,
      createTransaction
    );
    const editTransactionComponent = App.renderEditTransactionComponent(
      getTransaction,
      updateTransaction,
      accounts,
      currencies
    );
    const accountTree = App.renderAccountTree(accounts);
    const currencyTable = App.renderCurrencyTable(currencies);
    const journalComponent = App.renderJournalComponent(
      currencies,
      accounts,
      getPaginatedJournalDataForAccount
    );
    const accountBalanceEvolutionComponent = (
      App.renderAccountBalanceEvolutionComponent(
        getAccountBalanceEvolutionData,
        accounts,
        currencies,
      )
    );
    const accountFlowEvolutionReportComponent = (
      App.renderAccountFlowEvolutionReportComponent(
        accounts,
        getAccountsFlowsEvolutionData,
        currencies,
      )
    );

    // Prepares the router
    const router = makeRouter(this.getRoutesData({
      transactionTable,
      createAccForm,
      editAccountComponent,
      createTransactionForm,
      accountTree,
      currencyTable,
      editTransactionComponent,
      journalComponent,
      accountBalanceEvolutionComponent,
      accountFlowEvolutionReportComponent,
    }));

    return (
      <div className="App">
        {router}
      </div>
    );
  }

  /**
   * Returns the data for the routes of the App.
   */
  getRoutesData({
    transactionTable,
    createAccForm,
    editAccountComponent,
    createTransactionForm,
    accountTree,
    currencyTable,
    editTransactionComponent,
    journalComponent,
    accountBalanceEvolutionComponent,
    accountFlowEvolutionReportComponent,
  }) {
    return [
      {
        path: "/create-transaction/",
        text: "Create Transaction",
        component: () => createTransactionForm,
      },
      {
        path: "/edit-transaction/",
        text: "Edit Transaction",
        component: () => editTransactionComponent,
      },
      {
        path: "/transaction-table/",
        text: "Transaction Table",
        component: () => transactionTable
      },
      {
        path: "/create-account/",
        text: "Create Account",
        component: () => createAccForm
      },
      {
        path: "/edit-account/",
        text: "Edit Account",
        component: () => editAccountComponent
      },
      {
        path: "/account-tree/",
        text: "Account Tree",
        component: () => accountTree
      },
      {
        path: "/currency-table/",
        text: "Currency Table",
        component: () => currencyTable
      },
      {
        path: "/account-journal/",
        text: "Account Journal",
        component: () => journalComponent
      },
      {
        path: "/account-balance-evolution-report/",
        text: "Account Balance Evolution Report",
        component: () => accountBalanceEvolutionComponent,
      },
      {
        path: "/account-flow-evolution-report/",
        text: "Account Flow Evolution Report",
        component: () => accountFlowEvolutionReportComponent
      }
    ];
  }

  /**
   * Renders a TransactionTable for the App.
   * @param {Transaction[]} transactions - An array of transaction.
   * @param {Currency[]} currencies - An array of currencies.
   * @param {Account[]} accounts - An array of accounts.
   */
  static renderTransactionTable(transactions, currencies, accounts) {
    // Renders the transactionTable or a loading <p> if transactions is null
    if ((transactions != null) && (currencies != null) && (accounts != null)) {
      const getCurrency = newGetter(R.prop("pk"), currencies);
      const getAccount = newGetter(R.prop("pk"), accounts);
      return (
        <div className="TransactionTableDiv">
          <TransactionTable
            title="Recent Transactions"
            transactions={transactions}
            getCurrency={getCurrency}
            getAccount={getAccount} />
        </div>
      );
    } else {
      return <p>Loading...</p>;
    }
  }

  /**
   * Renders the CreateAccountComponent for the app.
   * @param {Account[]} accounts - An array of Accounts from where the user can
   *   choose, or null if not yet loaded.
   * @param {Function} createAcc - A function that receives account creation
   *   data and performs the post request to create the account.
   */
  renderCreateAccountComponent(accounts, createAcc) {
    if (accounts !== [] && !accounts) {
      return <p>Loading...</p>;
    }

    // After creating an account, we also want to refresh this.accounts
    const createAccAndRefreshState = (accRawParams) => {
      return createAcc(accRawParams).then((response) => {
        this.ajaxGetAccounts();
        return response;
      });
    };

    return (
      <CreateAccountComponent
        createAcc={createAccAndRefreshState}
        accounts={accounts} />
    );
  }

  static renderEditAccountComponent(accounts, updateAcc) {
    if (accounts !== [] && !accounts) {
      return <p>Loading...</p>;
    }
    return (
      <EditAccountComponent
        editAccount={updateAcc}
        accounts={accounts} />
    );
  }

  /**
   * Renders the CreateTransactionComponent for the app.
   * @param {Account[]} accounts - An array of accounts from where the user
   *    can choose.
   * @param {Currency[]} currencies - An Array of currencies from where the
   *    user can choose.
   * @param {function} createTransaction - A function that maps an
   *    TransactionSpec and performs creation of the transaction.
   */
  static renderCreateTransactionComponent(accounts, currencies, createTransaction) {
    if ((accounts !== [] && !accounts) || (currencies !== [] && !currencies)) {
      return <p>Loading...</p>;
    }
    return (
      <CreateTransactionComponent
        createTransaction={createTransaction}
        accounts={accounts}
        currencies={currencies} />
    );
  }

  static renderAccountTree(accounts) {
    if (accounts === null || accounts === undefined) {
      return <p>Loading...</p>;
    } else {
      return <AccountTree accounts={accounts} />;
    }
  }

  static renderCurrencyTable(currencies) {
    if (currencies !== [] && !currencies) {
      return <p>Loading...</p>;
    }
    return <CurrencyTable currencies={currencies} title="Currencies" />;
  }

  static renderEditTransactionComponent(
    getTransaction,
    updateTransaction,
    accounts,
    currencies
  ) {
    if (accounts == null || currencies == null) {
      return <p>Loading...</p>;
    }
    return (
      <EditTransactionComponent
        getTransaction={getTransaction}
        updateTransaction={updateTransaction}
        accounts={accounts}
        currencies={currencies} />
    );
  }

  static renderJournalComponent(
    currencies,
    accounts,
    getPaginatedJournalDataForAccount,
  ) {
    if (accounts == null || currencies == null) {
      return <p>Loading...</p>;
    }
    return (
      <JournalComponent
        accounts={accounts}
        isDescendant={isDescendant(accounts)}
        getCurrency={newGetter(R.prop('pk'), currencies)}
        columnMakers={defaultColumnMakers}
        getPaginatedJournalDataForAccount={getPaginatedJournalDataForAccount} />
    );
  }

  static renderAccountBalanceEvolutionComponent(
    getAccountBalanceEvolutionData,
    accounts,
    currencies
  ) {
    if (R.isNil(accounts) || R.isNil(currencies)) {
      return <p>Loading...</p>;
    }
    return createElement(
      AccountBalanceEvolutionComponent,
      {
        accounts,
        getCurrency: newGetter(R.prop("pk"), currencies),
        getAccountBalanceEvolutionData,
      }
    );
  }

  static renderAccountFlowEvolutionReportComponent(
    accounts,
    getAccountsFlowsEvolutionData,
    currencies,
  ) {
    if (R.isNil(accounts) || R.isNil(currencies)) {
      return <p>Loading...</p>;
    }
    return createElement(
      AccountFlowEvolutionReportComponent,
      {
        getAccountsFlowsEvolutionData,
        accounts,
        currencies,
        getCurrency: newGetter(R.prop("pk"), currencies),
        getAccount: newGetter(R.prop("pk"), accounts),
      }
    );
  }
}

export default App;
