import React, { Component, createElement } from 'react';
import * as R from 'ramda';
import * as RU from '../ramda-utils';
import MonthPicker from './MonthPicker';
import MultipleAccountsSelector from './MultipleAccountsSelector';
import AccountFlowEvolutionTable from './AccountFlowEvolutionTable';
import PortifolioFilePicker, { valueLens as PortifolioFilePickerValueLens } from './PortifolioFilePicker';
import CurrencyInput from './CurrencyInput';

export const Phases = {
  loading: 'loading',
  waiting: 'waiting',
};

export const extractAccountEvolutionDataParams = state => {
  const pickedPortifolio = R.view(lenses.pickedPortifolio, state);
  const targetCurrency = R.view(lenses.selectedTargetCurrency, state);
  return R.pipe(
    RU.mapLenses({
      accounts: lenses.selectedAccounts,
      monthsPair: lenses.pickedMonthsPair,
    }),
    R.ifElse(
      _ => pickedPortifolio,
      R.assocPath(['currencyOpts', 'portifolio'], pickedPortifolio),
      x => x,
    ),
    R.ifElse(
      _ => targetCurrency,
      R.assocPath(['currencyOpts', 'convertTo'], targetCurrency),
      x => x,
    )
  )(state);
};

export const portifolioFilePickerValueLens = R.lensPath(['portifolioFilePickerValue']);
export const lenses = {
  
  selectedAccounts: R.lensPath(['selectedAccounts']),
  selectedTargetCurrency: R.lensPath(['selectedTargetCurrency']),
  pickedMonthsPair: R.lensPath(['pickedMonthsPair']),
  pickedMonths(i) { return R.compose(this.pickedMonthsPair, R.lensPath([i])); },
  status: R.lensPath(['status']),
  statusPhase() { return R.compose(this.status, R.lensPath(['phase'])); },
  accountsFlows: R.lensPath(['accountsFlows']),
  tablePeriods: R.lensPath(['tablePeriods']),
  portifolioFilePickerValue: portifolioFilePickerValueLens,
  pickedPortifolio: R.compose(portifolioFilePickerValueLens, PortifolioFilePickerValueLens.portifolio),

};

export const reducers = {

  onMonthPick: R.curry(({pickedMonth, monthIndex}, state) => {
    let updatePickedMonthsPair = R.update(monthIndex, pickedMonth);
    return R.over(lenses.pickedMonthsPair, updatePickedMonthsPair, state);
  }),
  onSelectedAccountsChange: R.set(lenses.selectedAccounts),
  onSubmitReportQuery: R.set(lenses.statusPhase(), Phases.loading),
  onReportQueryIncomingData: ({accountsFlows, periods}) => R.pipe(
    R.set(lenses.statusPhase(), Phases.waiting),
    R.set(lenses.accountsFlows, accountsFlows),
    R.set(lenses.tablePeriods, periods),
  )
};

export const handlers = {

  onSubmitReportQuery: (props, state, setState) => {
    if (R.view(lenses.statusPhase(), state) === Phases.loading) {
      alert("Already loading!");
      return null;
    }
    setState(reducers.onSubmitReportQuery);
    let getFlowsArgs = extractAccountEvolutionDataParams(state);
    return props
      .getAccountsFlowsEvolutionData(getFlowsArgs)
      .then(R.pipe(reducers.onReportQueryIncomingData, setState))
      .catch(alert);
  }

};

export const defaultState = {
  pickedMonthsPair: [null, null],
  selectedAccounts: [null, null],
  status: { phase: Phases.waiting },
  accountsFlows: null,
};

export default class AccountFlowEvolutionReportComponent extends Component {

  constructor(props) {
    super(props);
    this.state = R.clone(defaultState);
    this.view = l => R.view(l, this.state);
  };

  renderTargetCurrencySelector = () => {
    const lens = lenses.selectedTargetCurrency;
    const value = this.view(lens);
    const currencies = this.props.currencies;
    const onChange = newVal => this.setState(R.set(lens, newVal));
    return createElement(CurrencyInput, { value, currencies, onChange });
  };

  renderPortifolioFilePicker = () => {
    let value = this.view(lenses.portifolioFilePickerValue);
    let onChange = reducerFn => {
      this.setState(R.over(lenses.portifolioFilePickerValue, reducerFn));
    };
    return createElement(PortifolioFilePicker, { value, onChange });
  };

  renderMonthPickerComponent = (monthIndex) => {
    let value = R.view(lenses.pickedMonths(monthIndex), this.state);
    let onPicked = pickedMonth => {
      this.setState(reducers.onMonthPick({pickedMonth, monthIndex}));
    };
    let props = {key: monthIndex, monthIndex, onPicked, value};
    return createElement(MonthPicker, props);
  }

  renderMultipleAccountSelector = () => {
    let accounts = this.props.accounts;
    let selectedAccounts = R.view(lenses.selectedAccounts, this.state);
    let onSelectedAccountsChange = x => {
      this.setState(reducers.onSelectedAccountsChange(x));
    };
    let props = {selectedAccounts, onSelectedAccountsChange, accounts};
    return createElement(MultipleAccountsSelector, props);
  }

  renderSubmitButton = () => {
    let setState = this.setState.bind(this);
    let onClick = () => {
      return handlers.onSubmitReportQuery(this.props, this.state, setState);
    };
    return createElement(submitButton, { onClick });
  }

  renderTable = () => {
    const accountsFlows = R.view(lenses.accountsFlows, this.state);
    const tablePeriods = R.view(lenses.tablePeriods, this.state);
    if (R.isNil(accountsFlows) || R.isNil(tablePeriods)) {
      return null;
    }
    const { getCurrency, getAccount } = this.props;
    const props = { getCurrency, getAccount, accountsFlows, periods: tablePeriods };
    return AccountFlowEvolutionTable(props);
  }

  renderInputs() {
    return [
      ["Target Currency", this.renderTargetCurrencySelector()],
      ["Currency Price Portifolio File", this.renderPortifolioFilePicker()],
      ["Initial and Final Month", [0, 1].map(this.renderMonthPickerComponent)],
      ["Accounts", this.renderMultipleAccountSelector()],
    ].map(([l, c], i) => (
      <div className="account-flow-evolution-report__input" key={i}>
        <span className="account-flow-evolution-report__input__label">{l}</span>
        <div className="account-flow-evolution-report__input__input">{c}</div>
      </div>
    ));
  }

  render() {
    return (
      <div className="account-flow-evolution-report">
        <div className="account-flow-evolution-report__inputs-container">
          {this.renderInputs()}
          {this.renderSubmitButton()}
        </div>
        {this.renderTable()}
      </div>
    );
  }

}

export function submitButton(props) {
  return createElement(
    'button',
    { className: "account-flow-evolution-report__submit-btn", ...props },
    "Submit"
  );
}
