import { createElement } from 'react';
import { mount } from 'enzyme';
import AccountBalanceEvolutionComponent, { makeMonthPickers, validateMonths, MONTH_VALIDATION_ERRORS, validateAccounts, ACCOUNT_VALIDATION_ERRORS, makeAccountBalanceEvolutionTable } from '../AccountBalanceEvolutionComponent';
import { AccountFactory, CurrencyFactory } from '../../testUtils';
import { newGetter, MonthUtil } from '../../utils';
import * as R from 'ramda';
import sinon from 'sinon';


function getExampleData(acc) {
  return {
    account: acc.pk,
    initialBalance: [],
    balanceEvolution: [[], [], []]
  };
}


function mountAccountBalanceEvolutionComponent(customProps={}) {
  const accounts = AccountFactory.buildList(2);
  const currency = CurrencyFactory.build();
  const getCurrency = newGetter(R.prop("pk"), [currency]);
  const data = R.map(getExampleData, accounts);
  const getAccountBalanceEvolutionData = () => Promise.resolve(data);
  const defaultProps = {
    data,
    accounts,
    getCurrency,
    getAccountBalanceEvolutionData,
  };
  const props = R.mergeDeepRight(defaultProps, customProps);
  return mount(createElement(AccountBalanceEvolutionComponent, props));
}

function findAccBalEvolTable(comp) {
  return comp.find("AccountBalanceEvolutionTable");
}

function findMonthPicker(comp, i) {
  const found = comp.find("MonthPicker");
  return R.isNil(i) ? found : found.at(i);
}

function findMultipleAccSelect(comp) {
  return comp.find('MultipleAccountsSelector');
}

function pickMonth(comp, month) {
  comp.props().onPicked(month);
}

function selectAccounts(comp, accs) {
  findMultipleAccSelect(comp).props().onSelectedAccountsChange(accs);
}

describe('AccountBalanceEvolutionComponent', () => {
  describe('Integration', () => {
    it('base', () => {
      const accounts = AccountFactory.buildList(2);
      const currency = CurrencyFactory.build();
      const getCurrency = newGetter(R.prop("pk"), [currency]);
      const data = {
        periods: [[], [], []],
        months: [{month: "February", year: 2018}, {month: "April", year: 2018}],
        data: accounts.map(acc => ({
          account: acc.pk,
          initialBalance: [],
          balanceEvolution: [[], [], []]
        }))
      };
      const getAccountBalanceEvolutionData = () => Promise.resolve(data);
      const component = mountAccountBalanceEvolutionComponent({
        data,
        accounts,
        getCurrency,
        getAccountBalanceEvolutionData,
      });
      // It sees no table there
      expect(findAccBalEvolTable(component)).toHaveLength(0);

      // The user selects the start and end months
      pickMonth(findMonthPicker(component, 0), data.months[0]);
      pickMonth(findMonthPicker(component, 1), data.months[1]);

      // And two accounts to use
      selectAccounts(component, accounts);

      // And submits
      const submitPromise = component.instance().handleSubmit();

      expect.assertions(5);
      return submitPromise.then(() => {
        // Let the component update.
        component.update();
        component.instance().forceUpdate();
        
        // It sees the new table there
        expect(findAccBalEvolTable(component)).toHaveLength(1);
        // And this table has the same data, getCurrency as the component
        [["data", data.data], ["getCurrency", getCurrency]].forEach(
          function([nm, val]) {
            expect(findAccBalEvolTable(component)).toHaveProp(nm, val);
          }
        );
        // And the expected monthLabels
        expect(findAccBalEvolTable(component)).toHaveProp(
          "monthsLabels",
          ["February/2018", "March/2018", "April/2018"]
        );
      });
    });
  });
  describe('handlePickedMonth', () => {
    it('base', () => {
      const component = mountAccountBalanceEvolutionComponent();
      expect(component).toHaveState("pickedMonths", [null, null]);

      const value = {month: "March", year: 2000};
      component.instance().handlePickedMonth(1)(value);

      expect(component).toHaveState("pickedMonths", [null, value]);
    });
  });
  it('handlePickedAccountsChange', () => {
    const accounts = AccountFactory.buildList(1);
    const component = mountAccountBalanceEvolutionComponent();
    expect(component).toHaveState("pickedAccounts", [null, null]);
    component.instance().handlePickedAccountsChange(accounts);
    expect(component).toHaveState("pickedAccounts", accounts);
  });
  describe('handleSubmit', () => {
    let component, validateMonths, validateAccounts,
        inject, getAccountBalanceEvolutionData, dataPromise,
        account, dataPromiseValue;
    beforeEach(() => {
      account = AccountFactory.build();
      dataPromiseValue = {
        data: [getExampleData(account)],
        months: [
          {month: "February", year: 2018},
          {month: "April", year: 2018}
        ]
      };
      dataPromise = Promise.resolve(dataPromiseValue);
      getAccountBalanceEvolutionData = sinon.fake.returns(dataPromise);
      component = mountAccountBalanceEvolutionComponent(
        { getAccountBalanceEvolutionData, accounts: [account] }
      );
      validateMonths = sinon.fake();
      validateAccounts = sinon.fake();
      inject = { validateMonths, validateAccounts };
      sinon.spy(component.instance(), 'setAccountBalanceEvolutionData');
      // Set some valid months to avoid some warnings
      component.setState({ pickedMonths: dataPromiseValue.months });
    });
    afterEach(() => {
      component.instance().setAccountBalanceEvolutionData.restore();
    });
    it('calls validateMonths', () => {
      component.setState({pickedMonths: [1, 2]});
      component.instance().handleSubmit(inject);
      expect(validateMonths.args).toEqual([[[1, 2]]]);
    });
    it('calls validateAccounts', () => {
      component.setState({pickedAccounts: [1, 2]});
      component.instance().handleSubmit(inject);
      expect(validateAccounts.args).toEqual([[[1, 2]]]);      
    });
    it('calls getAccountBalanceEvolutionData', () => {
      // This avoids warnings during mount
      getAccountBalanceEvolutionData = sinon.fake.resolves(
        dataPromiseValue
      );
      component.setProps({ getAccountBalanceEvolutionData });
      // Sets the input (as if from the user);
      component.setState({
        pickedAccounts: [1, 2],
        pickedMonths: [3, 4]
      });
      // Calls handleSubmit
      component.instance().handleSubmit(inject);
      // And ensures getAccountBalanceEvolutionData was called with the args
      expect(getAccountBalanceEvolutionData.args).toEqual([
        [[1, 2], [3, 4]]
      ]);
    });
    it('Calls setAccountBalanceEvolutionData with response', () => {
      expect.assertions(1);
      return component.instance().handleSubmit(inject).then(() => {
        expect(component.instance().setAccountBalanceEvolutionData.args).toEqual([
          [dataPromiseValue]
        ]);
      });
    });
    it.each(
      [['validateMonths', 'invalid month'], ['validateAccounts', 'invalid acc']]
    )('Fails if validatoin for %s fails', (functionName, errMsg) => {
      const inject = {};
      inject['alert'] = sinon.fake();
      inject[functionName] = () => errMsg;
      component.setProps({inject});
      expect.assertions(2);
      return component.instance().handleSubmit().then(x => {
        expect(x).toBe(undefined);
        expect(inject['alert'].args).toEqual([[errMsg]]);
      });
    });
  });
  describe('MultipleAccountSelector', () => {
    it('Passes accounts prop', () => {
      const accounts = AccountFactory.buildList(2);
      const comp = mountAccountBalanceEvolutionComponent({ accounts });
      expect(findMultipleAccSelect(comp)).toHaveProp('accounts', accounts);
    });
    it('Passes selectedAccount', () => {
      const selectedAccounts = AccountFactory.buildList(1);
      const comp = mountAccountBalanceEvolutionComponent({});
      comp.instance().handlePickedAccountsChange(selectedAccounts);
      comp.update();
      expect(findMultipleAccSelect(comp)).toHaveProp(
        'selectedAccounts',
        selectedAccounts
      );
    });
    it('Calls handlePickedAccountsChange on change', () => {
      const comp = mountAccountBalanceEvolutionComponent();
      const newAccounts = AccountFactory.buildList(3);
      sinon.spy(comp.instance(), 'handlePickedAccountsChange');
      selectAccounts(comp, newAccounts);
      expect(comp.instance().handlePickedAccountsChange.args)
        .toEqual([[newAccounts]]);
      comp.instance().handlePickedAccountsChange.restore();
    });
  });
});

describe('makeMonthPickers', () => {
  // Fakes react createElement
  const createElement = sinon.fake();
  // Fakes the MonthPicker component
  const MonthPicker = {};
  // Values parsed to MonthPicker
  const values = [{}, {}];
  // Fakes the values passed as onPicked
  const onPickedFuns = [{}, {}];
  const resp = makeMonthPickers(
    values,
    i => onPickedFuns[i],
    { MonthPicker, createElement }
  );
  it('Calls MonthPicker with values and onPicked', () => {
    expect(createElement.args).toEqual([
      [MonthPicker, {key: 0, value: values[0], onPicked: onPickedFuns[0]}],
      [MonthPicker, {key: 1, value: values[1], onPicked: onPickedFuns[1]}],
    ]);
  });
  it('Returns createElement mapped', () => {
    expect(resp).toEqual([createElement(), createElement()]);
  });
});

describe('makeAccountBalanceEvolutionTable', () => {
  let data, getCurrency, getAccount, createElement,
      AccountBalanceEvolutionTable, inject;
  beforeEach(() => {
    data = {
      data: [],
      months: [{month: 'april', year: 2019}, {month: 'june', year: 2019}]
    };
    getCurrency = sinon.fake();
    getAccount = sinon.fake();
    createElement = sinon.fake();
    AccountBalanceEvolutionTable = sinon.fake();
    inject = { createElement, AccountBalanceEvolutionTable };    
  });
  it('Returns null if data is null or undefined', () => {
    expect(makeAccountBalanceEvolutionTable(null)).toEqual(null);
    expect(makeAccountBalanceEvolutionTable(undefined)).toEqual(null);
  });
  it('Calls createElement with AccountBalanceEvolutionTable and props', () => {
    makeAccountBalanceEvolutionTable(data, getCurrency, getAccount, inject);
    expect(createElement.args).toEqual([
      [
        AccountBalanceEvolutionTable,
        {
          monthsLabels: R.map(
            MonthUtil.toLabel,
            // Note months must come from data.months and not months
            // this way when we update the select months the table won't change
            MonthUtil.monthsBetween(...data.months)
          ),
          data: data.data,
          getCurrency,
          getAccount
        }
      ]
    ]);
  });
});

describe('validateMonths', () => {
  it('Valid', () => {
    const months = [
      {month: "February", year: 2018},
      {month: "March", year: 2018}
    ];
    expect(validateMonths(months)).toEqual(null);
  });
  it('Second later than first', () => {
    const months = [
      {month: "March", year: 2018},
      {month: "February", year: 2018}
    ];
    expect(validateMonths(months)).toEqual(MONTH_VALIDATION_ERRORS.INVALID_ORDER);
  });
  it('Equal', () => {
    const months = [
      {month: "March", year: 2018},
      {month: "March", year: 2018}
    ];
    expect(validateMonths(months)).toEqual(MONTH_VALIDATION_ERRORS.INVALID_ORDER);
  });
  it('One is null', () => {
    const months = [null, {month: "March", year: 2018}];
    expect(validateMonths(months)).toEqual(MONTH_VALIDATION_ERRORS.IS_NULL);
  });
  it('Unkown', () => {
    const months = [{month: "Unkown", year: 2019}];
    expect(validateMonths(months))
      .toEqual(MONTH_VALIDATION_ERRORS.UNKOWN_MONTH(months[0]));
  });
});

describe('validateAccounts', () => {
  it('base', () => {
    const accounts = AccountFactory.buildList(2);
    expect(validateAccounts(accounts)).toBe(null);
  });
  it('not null', () => {
    const accounts = [AccountFactory.build(), null, AccountFactory.build()];
    expect(validateAccounts(accounts)).toBe(ACCOUNT_VALIDATION_ERRORS.IS_NULL);
  });
  it('empty', () => {
    const accounts = [];
    expect(validateAccounts(accounts)).toBe(ACCOUNT_VALIDATION_ERRORS.EMPTY);
  });
});
