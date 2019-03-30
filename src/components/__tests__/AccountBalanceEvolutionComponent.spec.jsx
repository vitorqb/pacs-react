import React, { createElement } from 'react';
import { mount } from 'enzyme';
import AccountBalanceEvolutionComponent, { makeMonthPickers, makeAccountInputs, validateMonths, MONTH_VALIDATION_ERRORS, validateAccounts, ACCOUNT_VALIDATION_ERRORS, makeAccountBalanceEvolutionTable } from '../AccountBalanceEvolutionComponent';
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
      expect(component.find("AccountBalanceEvolutionTable")).toHaveLength(0);

      // The user selects the start and end months
      component.find("MonthPicker").at(0).props().onPicked(data.months[0]);
      component.find("MonthPicker").at(1).props().onPicked(data.months[1]);

      // And two accounts to use
      [0, 1].forEach(function(i) {
          component.find("AccountInput").at(i).props().onChange(accounts[i]);
      });

      // And submits
      const submitPromise = component.instance().handleSubmit();

      expect.assertions(5);
      return submitPromise.then(() => {
        // Let the component update.
        component.update();
        component.instance().forceUpdate();
        
        // It sees the new table there
        const table = component.find("AccountBalanceEvolutionTable");
        expect(table).toHaveLength(1);
        // And this table has the same data, getCurrency as the component
        [["data", data.data], ["getCurrency", getCurrency]].forEach(
          function([nm, val]) {
            expect(table).toHaveProp(nm, val);
          }
        );
        // And the expected monthLabels
        expect(table).toHaveProp(
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
  describe('handleAccountInputValueChange', () => {
    it('base', () => {
      const component = mountAccountBalanceEvolutionComponent();
      expect(component).toHaveState("pickedAccounts", [null, null]);
      const value = component.props().accounts[0];
      component.instance().handleAccountInputValueChange(1, value);
      expect(component).toHaveState("pickedAccounts", [null, value]);
    });
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
      const resp = component.instance().handleSubmit(inject);
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


describe('makeAccountInputs', () => {
  const AccountInput = {};
  const createElement = sinon.fake();
  const accounts = AccountFactory.buildList(2);
  const values = [null, null];
  const onChangeFuns = [{}, {}];
  const onChange = i => onChangeFuns[i];
  const resp = makeAccountInputs(
    accounts,
    values,
    onChange,
    { createElement, AccountInput }
  );
  it('Calls CreateElement to create AccountInput', () => {
    expect(createElement.args).toEqual([
      [AccountInput, { key: 0, accounts, value: values[0], onChange: onChangeFuns[0] }],
      [AccountInput, { key: 1, accounts, value: values[1], onChange: onChangeFuns[1] }],
    ]);
  });
  it('Returns createElements mapped', () => {
    expect(resp).toEqual([createElement(), createElement()]);
  });
});

describe('makeAccountBalanceEvolutionTable', () => {
  let data, months, getCurrency, getAccount, createElement,
      AccountBalanceEvolutionTable, inject;
  beforeEach(() => {
    data = {
      data: [],
      months: [{month: 'april', year: 2019}, {month: 'june', year: 2019}]
    };
    months = [{month: "May", year: 2000}, {month: "May", year: 2001}];
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
    const resp = makeAccountBalanceEvolutionTable(
      data, getCurrency, getAccount, inject
    );
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
  })
});
