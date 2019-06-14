import React, { Component, createElement } from 'react';
import * as R from 'ramda';
import { imutableLensPath } from '../utils';
import MonthPicker from './MonthPicker';
import MultipleAccountsSelector from './MultipleAccountsSelector';
import AccountFlowEvolutionTable from './AccountFlowEvolutionTable';

export const Phases = {
  loading: 'loading',
  waiting: 'waiting',
};

export const lenses = {

  // Props
  accounts: imutableLensPath(['accounts']),
  getCurrency: imutableLensPath(['getCurrency']),
  getAccount: imutableLensPath(['getAccount']),
  
  // State
  selectedAccounts: R.lensPath(['selectedAccounts']),
  pickedMonthsPair: R.lensPath(['pickedMonthsPair']),
  pickedMonths(i) { return R.compose(this.pickedMonthsPair, R.lensPath([i])); },
  status: R.lensPath(['status']),
  statusPhase() { return R.compose(this.status, R.lensPath(['phase'])); },
  accountsFlows: R.lensPath(['accountsFlows']),
  tablePeriods: R.lensPath(['tablePeriods']),

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
    if (R.view(lenses.statusPhase(), state) == Phases.loading) {
      alert("Already loading!");
      return null;
    }
    setState(reducers.onSubmitReportQuery);
    let accounts = R.view(lenses.selectedAccounts, state);
    let monthsPair = R.view(lenses.pickedMonthsPair, state);
    let getFlowsArgs = {accounts, monthsPair};
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
  }

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

  render() {
    let monthPickersComponents = [0, 1].map(this.renderMonthPickerComponent);
    let multipleAccountsSelector = this.renderMultipleAccountSelector();
    let submitButton = this.renderSubmitButton();
    let table = this.renderTable();
    return (
      <div>
        <div>
          {monthPickersComponents}
        </div>
        <div>
          {multipleAccountsSelector}
        </div>
        {submitButton}
        <div>
          {table}
        </div>
      </div>
    );
  }

}

export function submitButton(props) {
  return createElement('button', props, "Submit!");
}
