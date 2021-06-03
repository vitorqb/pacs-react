import * as R from 'ramda';
import React, { Component } from 'react';
import * as RU from './ramda-utils';
import * as Routes from './App/Routes.jsx';
import { mkAxiosWrapperFromSecrets, AxiosProvider } from "./axios.jsx";
import { LoginPage as LoginPageV2 } from './components/LoginPagev2/LoginPageV2';
import { LoginProvider } from './components/LoginProvider/LoginProvider';
import SecretLens from './domain/Secrets/Lens.js';
import { makeRouter } from './App/Router';
import * as Ajax from './App/Ajax.jsx';
import * as AppContext from './App/AppContext.jsx';
import * as AppContextGetters from './App/AppContextGetters';
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
import CurrencyExchangeRateDataFetcherComponentInstance from './App/Instances/CurrencyExchangeRateDataFetcherComponent.jsx';
import { lens as EventsLens } from './App/Events';
import { LoginSvc } from './services/LoginSvc';

class App extends Component {

  constructor(props) {
    // Defines the initial state, depending on whether `secrets` have been given as props
    super(props);
    this.setState = this.setState.bind(this);
    this.loginSvc = new LoginSvc({axios: mkAxiosWrapperFromSecrets(this.props.secrets)});
  }

  render() {

    // Prepares the state, appContextGetters and ajax functions
    const state = this.state;

    // Prepares the router
    const renderRouter = ({appContext, refreshAppContext, ajaxInjections}) => {
      const appContextGetters = AppContextGetters.makeGetters(appContext);
      const events = RU.objFromPairs(
        EventsLens.refetchAppContext, () => refreshAppContext(),
        EventsLens.setState, R.curry((lens, val) => this.setState(R.set(lens, val))),
        EventsLens.overState, R.curry((lens, fn) => this.setState(R.over(lens, fn))),
      );
      const renderArgs = { appContext, appContextGetters, ajaxInjections, events };
      const routeData = Routes.getRoutesData({
        transactionTable: TransactionTableInstace(renderArgs),
        createAccForm: CreateAccountComponentInstance(renderArgs),
        editAccountComponent: EditAccountComponentInstance(renderArgs),
        createTransactionForm: CreateTransactionFormInstance(renderArgs),
        accountTree: AccountTreeInstance(renderArgs),
        currencyTable: CurrencyTableInstance(renderArgs),
        editTransactionComponent: EditTransactionComponentInstance(renderArgs),
        journalComponent: JournalComponentInstance(renderArgs),
        accountBalanceEvolutionComponent: AccountBalanceEvolutionComponentInstance(renderArgs),
        accountFlowEvolutionReportComponent: AccountFlowEvolutionReportComponentInstance(renderArgs),
        DeleteAccountComponent: DeleteAccountComponentInstance(renderArgs),
        fetchCurrencyExchangeRateDataComponent: CurrencyExchangeRateDataFetcherComponentInstance(renderArgs)
      });
      return makeRouter(routeData);
    };

    const baseUrl = R.view(SecretLens.host, this.props.secrets);

    return (
      <div className="App">

        <LoginProvider
          loginSvc={this.loginSvc}
          renderLoginPage={renderProps => <LoginPageV2 {...renderProps} />}
        >
          {tokenValue => (
            <AxiosProvider token={tokenValue} baseUrl={baseUrl}>
              {axios => (
                <Ajax.AjaxInjectionsProvider axios={axios}>
                  {ajaxInjections => (
                    <AppContext.AppContextFetcherProvider ajaxInjections={ajaxInjections}>
                      {({appContext, refreshAppContext}) => (
                        renderRouter({appContext, refreshAppContext, ajaxInjections})
                      )}
                    </AppContext.AppContextFetcherProvider>
                  )}
                </Ajax.AjaxInjectionsProvider>
              )}
            </AxiosProvider>
          )}
        </LoginProvider>
      </div>
    );
  }
}

export default App;
