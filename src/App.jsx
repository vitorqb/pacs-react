import * as R from 'ramda';
import React, { Component } from 'react';
import * as RU from './ramda-utils';
import { mkAxiosWrapper } from "./ajax";
import LoginPage, { valueLens as loginPageValueLens } from './components/LoginPage';
import { LoginPage as LoginPageV2 } from './components/LoginPagev2/LoginPageV2';
import { LoginProvider } from './components/LoginProvider/LoginProvider';
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
import AccountBalanceEvolutionComponentInstance, { initialState as AccountBalanceEvolutionComponentInstanceInitialSatate } from './App/Instances/AccountBalanceEvolutionComponent';
import AccountFlowEvolutionReportComponentInstance from './App/Instances/AccountFlowEvolutionReportComponent';
import DeleteAccountComponentInstance from './App/Instances/DeleteAccountComponent';
import CurrencyExchangeRateDataFetcherComponentInstance from './App/Instances/CurrencyExchangeRateDataFetcherComponent.jsx';
import { lens as EventsLens } from './App/Events';
import { UrlUtil } from './utils';
import { LoginSvc } from './services/LoginSvc';

export const initialStateFromProps = ({ secrets }) => R.pipe(
  R.set(lens.remoteFetchingStatus, RemoteFetchingStatusEnum.uninitialized),
  R.when(
    _ => secrets,
    RU.setLenses([[lens.secrets, secrets], [lens.isLoggedIn, true]]),
  ),
  R.set(
    lens.accountBalanceEvolutionInstanceValue,
    AccountBalanceEvolutionComponentInstanceInitialSatate,
  )
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
    this.loginSvc = new LoginSvc({axios: this.getAxiosWrapper()});
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

  render() {

    // If we are logged in but the state is not ready, we are loading...
    const remoteFetchingStatus = R.view(lens.remoteFetchingStatus, this.state);
    const isLoading = remoteFetchingStatus === RemoteFetchingStatusEnum.uninitialized
          || remoteFetchingStatus === RemoteFetchingStatusEnum.loading;

    // Prepares the state, stateGetters and ajax functions
    const state = this.state;
    const ajaxInjections = this.getAjaxInjections();
    const stateGetters = StateGetters.makeGetters(state);
    const events = RU.objFromPairs(
      EventsLens.refetchState, () => this.goFetchRemoteData(),
      EventsLens.setState, R.curry((lens, val) => this.setState(R.set(lens, val))),
      EventsLens.overState, R.curry((lens, fn) => this.setState(R.over(lens, fn))),
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
    const fetchCurrencyExchangeRateDataComponent =
          CurrencyExchangeRateDataFetcherComponentInstance(renderArgs);

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
      fetchCurrencyExchangeRateDataComponent
    }));

    return (
      <div className="App">
        <LoginProvider
          loginSvc={this.loginSvc}
          renderLoginPage={renderProps => (
            <LoginPageV2 {...renderProps} />
          )}
        >
          {tokenValue => (
            <>
              <div className={loadingWrapperClassName(isLoading)}>
                <span className="loading-wrapper__label">Loading...</span>
              </div>
              {router}
            </>
          )}
        </LoginProvider>
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
    fetchCurrencyExchangeRateDataComponent
  }) {
    return [
      {
        text: "Transaction",
        listOfLinkData: [
          {
            path: "/create-transaction/",
            text: "Create",
            component: () => createTransactionForm,
          },
          {
            path: "/edit-transaction/",
            text: "Edit",
            component: () => editTransactionComponent,
          },
          {
            path: "/transaction-table/",
            text: "Table",
            component: () => transactionTable
          }
        ]
      },
      {
        text: "Account",
        listOfLinkData: [
          {
            path: "/create-account/",
            text: "Create",
            component: () => createAccForm
          },
          {
            path: "/edit-account/",
            text: "Edit",
            component: () => editAccountComponent
          },
          {
            path: "/delete-account/",
            text: "Delete",
            component: () => DeleteAccountComponent
          },
          {
            path: "/account-tree/",
            text: "Tree",
            component: () => accountTree
          },
          {
            path: "/account-journal/",
            text: "Journal",
            component: () => journalComponent
          },
        ]
      },
      {
        text: "Reports",
        listOfLinkData: [
          {
            path: "/account-balance-evolution-report/",
            text: "Balance Evolution Report",
            component: () => accountBalanceEvolutionComponent,
          },
          {
            path: "/account-flow-evolution-report/",
            text: "Flow Evolution Report",
            component: () => accountFlowEvolutionReportComponent
          }
        ]
      },
      {
        text: "Currency",
        listOfLinkData: [
          {
            path: "/currency-table/",
            text: "Table",
            component: () => currencyTable
          },
          {
            path: "/exchange-rate-data/fetch/",
            text: "Exchange Rate Data Fetcher",
            component: () => fetchCurrencyExchangeRateDataComponent
          }
        ]
      }
    ];
  }
}

// Helpers
/**
 * Reads the LoginPage Value from the state. Applies defaults.
 * @param guessBackendUrlFn - 0-arg function returning current url.
 * @param state - The App state from where the login state with be queried.
 */
export const viewLoginPageValue = R.curry((guessBackendUrlFn, state) => {
  return R.pipe(
    R.view(lens.loginPageValue),
    R.over(loginPageValueLens.host, x => R.isNil(x) ? guessBackendUrlFn() : x)
  )(state);
});

export default App;
