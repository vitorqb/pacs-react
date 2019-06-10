import { createElement } from 'react';
import sinon from 'sinon';
import AccountFlowEvolutionReportComponent, { reducers, handlers, lenses, Phases, submitButton } from '../AccountFlowEvolutionReportComponent';
import { mount } from 'enzyme';
import * as R from 'ramda';
import MultipleAccountsSelector from '../MultipleAccountsSelector';
import { MonthUtil } from '../../utils';
import { CurrencyFactory, AccountFactory, MonthFactory, AccountFlowFactory } from '../../testUtils';

// Helpers
function mountAccountFlowEvolutionReportComponent(props={}) {
  let finalProps = {};
  finalProps.accounts = props.accounts || [];
  finalProps.getAccountsFlowsEvolutionData =
    props.getAccountsFlowsEvolutionData || sinon.fake.resolves();
  finalProps.getAccount = () => AccountFactory.build();
  finalProps.getCurrency = () => CurrencyFactory.build();
  return mount(createElement(AccountFlowEvolutionReportComponent, finalProps));
}
function findMonthPicker(comp, i) {
  const found = comp.find("MonthPicker");
  return R.isNil(i) ? found : found.at(i);
}
const pickMonth = (comp, month) => comp.props().onPicked(month);
const getMonthPickerProps = (c, i) => findMonthPicker(c, i).props();
const findMultipleAccountsSelector = c => c.find(MultipleAccountsSelector);
const simulateSelectedAccountsChange = (c, accs) => {
  c.props().onSelectedAccountsChange(accs);
};
const simulateSubmit = c => c.find(submitButton).props().onClick();
const getPickedMonthsPair = (comp) => R.view(lenses.pickedMonthsPair, comp.state());
const getSelectedAccounts = (c) => R.view(lenses.selectedAccounts, c.state());
const getMultipleAccountsSelectorProps = c => findMultipleAccountsSelector(c).props();
const getStatus = c => R.view(lenses.status, c.state());
const getStatusPhase = c => R.view(lenses.statusPhase(), c.state());
const getAccountsFlows = c => R.view(lenses.accountsFlows, c.state());
const getTablePeriods = c => R.view(lenses.tablePeriods, c.state());

// Tests
describe('AccountFlowEvolutionReportComponent', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    // Silent some warnings
    sandbox.stub(window, 'alert').callsFake(()=>{});
  });
  afterEach(() => { sandbox.restore(); });

  it('Initial state', () => {
    let component = mountAccountFlowEvolutionReportComponent();
    expect(getStatus(component)).toEqual({phase: Phases.waiting});
    expect(getPickedMonthsPair(component)).toEqual([null, null]);
    expect(getSelectedAccounts(component)).toEqual([null, null]);
    expect(getAccountsFlows(component)).toEqual(null);
  });
  
  it('Setting the monthsPairs', () => {
    let component = mountAccountFlowEvolutionReportComponent();
    pickMonth(findMonthPicker(component, 1), "BAR");
    expect(getPickedMonthsPair(component)).toEqual([null, "BAR"]);
    pickMonth(findMonthPicker(component, 0), "FOO");
    expect(getPickedMonthsPair(component)).toEqual(["FOO", "BAR"]);
    component.update();
    expect(getMonthPickerProps(component, 0).value).toEqual("FOO");
    expect(getMonthPickerProps(component, 1).value).toEqual("BAR");
  });

  it('Setting the accounts', () => {
    let component = mountAccountFlowEvolutionReportComponent();
    simulateSelectedAccountsChange(findMultipleAccountsSelector(component), [1, 2]);
    expect(getSelectedAccounts(component)).toEqual([1, 2]);
    component.update();
    expect(getMultipleAccountsSelectorProps(component).selectedAccounts)
      .toEqual([1, 2]);
  });

  it('Submiting the query', () => {
    const accounts = AccountFactory.buildList(3);
    const accountsFlows = AccountFlowFactory.buildList(3);
    const periods = R.map(MonthUtil.monthToPeriod, MonthFactory.buildList(3));
    const ajaxGetResponse = {accountsFlows, periods};
    const getAccountsFlowsEvolutionData = sinon.fake.resolves(ajaxGetResponse);
    const props = { getAccountsFlowsEvolutionData, accounts };
    const component = mountAccountFlowEvolutionReportComponent(props);

    // Pick some accounts
    const selectedAccounts = [accounts[0]];
    simulateSelectedAccountsChange(
      findMultipleAccountsSelector(component),
      selectedAccounts,
    );

    // Pick some months
    const months = MonthFactory.buildList(2);
    pickMonth(findMonthPicker(component, 0), months[0]);
    pickMonth(findMonthPicker(component, 1), months[1]);

    // Submit
    const submitPromise = simulateSubmit(component);

    // Should be loading now
    expect(getStatusPhase(component)).toEqual(Phases.loading);

    // Should have called the getAccountFlowsEvolutionDate
    const expectedArgs = {accounts: selectedAccounts, monthsPair: months};
    expect(getAccountsFlowsEvolutionData.args).toEqual([[expectedArgs]]);

    // The promise returns
    expect.assertions(5);
    submitPromise.then(() => {
      component.update();
      // No longet loading
      expect(getStatusPhase(component)).toEqual(Phases.waiting);
      // Data is set
      expect(getAccountsFlows(component)).toEqual(accountsFlows);
      expect(getTablePeriods(component)).toEqual(periods);
    });
  });

  it('Passes accounts from props to multiple accounts selector', () => {
    let accounts = ["FOO", "BAR"];
    let component = mountAccountFlowEvolutionReportComponent({accounts});
    expect(getMultipleAccountsSelectorProps(component).accounts)
      .toEqual(accounts);
  });

  describe('reducers.onMonthPick', () => {
    let originalState = {pickedMonthsPair: [null, null]};
    let pickedMonth = "FOO";

    it('Index 0', () => {
      let monthIndex = 0;
      let eventData = {pickedMonth, monthIndex};
      let expectedState = {pickedMonthsPair: ["FOO", null]};
      expect(reducers.onMonthPick(eventData, originalState)).toEqual(expectedState);
    });

    it('Index 1', () => {
      let monthIndex = 1;
      let eventData = {pickedMonth, monthIndex};
      let expectedState = {pickedMonthsPair: [null, "FOO"]};
      expect(reducers.onMonthPick(eventData, originalState)).toEqual(expectedState);      
    });

  });

  it('reducers.onSubmitReportQuery', () => {
    let originalState = {};
    let expectedState = {status: {phase: Phases.loading}};
    expect(reducers.onSubmitReportQuery(originalState)).toEqual(expectedState);
  });

  it('reducers.onReportQueryIncomingData', () => {
    const accountsFlows = "ACCOUNT_FLOWS";
    const periods = "PERIODS";
    const ajaxGetResponse = {accountsFlows, periods};
    const originalState = {};
    const expectedState = {
      status: {phase: Phases.waiting},
      accountsFlows,
      tablePeriods: periods,
    };
    expect(reducers.onReportQueryIncomingData(ajaxGetResponse)(originalState))
      .toEqual(expectedState);
  });

  it('handlers.onSubmitReportQuery', () => {
    let selectedAccounts = AccountFactory.buildList(3);
    let pickedMonthsPair = MonthFactory.buildList(2);
    let expectedArgs = {accounts: selectedAccounts, monthsPair: pickedMonthsPair};
    let getAccountsFlowsEvolutionData = args => {
      expect(args).toEqual(expectedArgs);
      return {
        then: f => {
          f("FOO");
          return { catch: ()=>{} }; }
      };
    };
    let props = {getAccountsFlowsEvolutionData};
    let state = {pickedMonthsPair, selectedAccounts};
    let setState = sinon.fake();
    let onReportQueryIncomingData = sandbox
        .stub(reducers, 'onReportQueryIncomingData')
        .returns("BAR");

    handlers.onSubmitReportQuery(props, state, setState);

    expect(setState.args).toEqual([[reducers.onSubmitReportQuery], ["BAR"]]);
    expect(onReportQueryIncomingData.args).toEqual([["FOO"]]);
    expect.assertions(3);
  });

  it('handlers.onSubmitReportQuery ignores if already loading', () => {
    let props = {};
    let state = R.set(lenses.statusPhase(), Phases.loading, {});
    let setState = sinon.fake();
    handlers.onSubmitReportQuery(props, state, setState);
    expect(setState.called).toBe(false);
  });
  
});
