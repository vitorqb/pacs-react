import * as R from 'ramda';
import React, { Component } from 'react';
import './App.scss';
import * as RU from './ramda-utils';
import { mkAxiosWrapper } from "./ajax";
import LoginPage from './components/LoginPage';
import * as SecretsValidation from './domain/Secrets/Validation';
import ErrorMessage from './components/ErrorMessage';
import { makeRouter } from './App/Router';
import lens, { RemoteFetchingStatusEnum } from './App/Lens';
import * as Ajax from './App/Ajax';
import * as Fetcher from './App/Fetcher';
import * as StateGetters from './App/StateGetters';
import TransactionTableInstace from './App/Instances/TransactionTable';
import CreateAccountComponentInstance from './App/Instances/CreateAccountComponent';
import EditAccountComponentInstance from './App/Instances/EditAccountComponent';
import CreateTransactionFormInstance from './App/Instances/CreateTransactionForm';
import EditTransactionComponentInstance from './App/Instances/EditTransactionComponent';
import AccountTreeInstance from './App/Instances/AccountTree';
import CurrencyTableInstance from './App/Instances/CurrencyTable';
import JournalComponentInstance from './App/Instances/JournalComponent';
import AccountBalanceEvolutionComponentInstance from './App/Instances/AccountBalanceEvolutionComponent';
import AccountFlowEvolutionReportComponentInstance from './App/Instances/AccountFlowEvolutionReportComponent';
import DeleteAccountComponentInstance from './App/Instances/DeleteAccountComponent';
import { lens as EventsLens } from './App/Events';

export const initialStateFromProps = ({ secrets }) => R.pipe(
  R.set(lens.remoteFetchingStatus, RemoteFetchingStatusEnum.uninitialized),
  R.when(
    _ => secrets,
    RU.setLenses([[lens.secrets, secrets], [lens.isLoggedIn, true]]),
  ),
)({});

export const loadingWrapperClassName = isLoading => {
  return `loading-wrapper loading-wrapper--${isLoading ? "active" : "deactive"}`;
};

class App extends Component {

  constructor(props) {
    // Defines the initial state, depending on whether `secrets` have been given as props
    super(props);
    this.state = initialStateFromProps(props);
    this.goFetchRemoteData = this.goFetchRemoteData.bind(this);
    this.setState = this.setState.bind(this);
  }

  /**
   * Returns an axiosWrapper to use, based on the secrets lens of the state.
   */
  getAxiosWrapper = () => mkAxiosWrapper(R.view(lens.secrets, this.state))

  /**
   * Returns the ajax injections for the app.
   */
  getAjaxInjections = () => Ajax.ajaxInjections(this.getAxiosWrapper());

  // Setters
  setRemoteFetchingStatus = x => this.setState(R.set(lens.remoteFetchingStatus, x))

  /**
   * Fetches all remote data that has to be fetched during initialization.
   * Assumes we have valid secrets stored in the state.
   */
  async goFetchRemoteData() {
    this.setRemoteFetchingStatus(RemoteFetchingStatusEnum.loading);
    const reducer = await Fetcher.fetch(this.getAjaxInjections());
    this.setState(reducer);
    this.setRemoteFetchingStatus(RemoteFetchingStatusEnum.finished);
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
    const isLoading = remoteFetchingStatus === RemoteFetchingStatusEnum.uninitialized
          || remoteFetchingStatus === RemoteFetchingStatusEnum.loading;

    // Prepares the state, stateGetters and ajax functions
    const state = this.state;
    const ajaxInjections = this.getAjaxInjections();
    const stateGetters = StateGetters.makeGetters(state);
    const events = RU.setLenses(
      [
        [
          EventsLens.refetchState,
          () => this.goFetchRemoteData()
        ],
        [
          EventsLens.overState,
          R.curry((lens, fn) => this.setState(R.over(lens, fn))),
        ],
      ],
      {},
    );
    const renderArgs = { state, stateGetters, ajaxInjections, events };

    // Prepares the instances
    const transactionTable = TransactionTableInstace(renderArgs);
    const createAccForm = CreateAccountComponentInstance(renderArgs);
    const editAccountComponent = EditAccountComponentInstance(renderArgs);
    const createTransactionForm = CreateTransactionFormInstance(renderArgs);
    const editTransactionComponent = EditTransactionComponentInstance(renderArgs);
    const accountTree = AccountTreeInstance(renderArgs);
    const currencyTable = CurrencyTableInstance(renderArgs);
    const journalComponent = JournalComponentInstance(renderArgs);
    const accountBalanceEvolutionComponent =
          AccountBalanceEvolutionComponentInstance(renderArgs);
    const accountFlowEvolutionReportComponent =
          AccountFlowEvolutionReportComponentInstance(renderArgs);
    const DeleteAccountComponent = DeleteAccountComponentInstance(renderArgs);

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
      DeleteAccountComponent,
    }));

    return (
      <div className="App">
        <div className={loadingWrapperClassName(isLoading)}>
          <span className="loading-wrapper__label">Loading...</span>
        </div>
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
    DeleteAccountComponent,
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
        path: "/delete-account/",
        text: "Delete Account",
        component: () => DeleteAccountComponent
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
}

export default App;
