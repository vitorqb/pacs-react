import { createElement } from 'react';
import { mount } from 'enzyme';
import AccountBalanceEvolutionComponent, { makeMonthPickers, validateMonths, MONTH_VALIDATION_ERRORS, validateAccounts, ACCOUNT_VALIDATION_ERRORS, makeAccountBalanceEvolutionTable } from '../AccountBalanceEvolutionComponent';
import * as sut from '../AccountBalanceEvolutionComponent';
import { AccountFactory, CurrencyFactory } from '../../testUtils';
import { newGetter, MonthUtil } from '../../utils';
import * as R from 'ramda';
import * as RU from '../../ramda-utils';
import sinon from 'sinon';

function getExampleData(acc) {
  return {
    account: acc.pk,
    initialBalance: [],
    balanceEvolution: [[], [], []],
  };
}


function mountAccountBalanceEvolutionComponent(customProps={}) {
  const accounts = AccountFactory.buildList(2);
  const currency = CurrencyFactory.build();
  const getCurrency = newGetter(R.prop("pk"), [currency]);
  const data = {
    data: R.map(getExampleData, accounts),
    months: [{year: 2018, month: "January"}, {year: 2018, month: "March"}],
  };
  const onChange = sinon.fake();
  const getAccountBalanceEvolutionData = () => Promise.resolve(data);
  const defaultValue = RU.objFromPairs(
    sut.valueLens.data, data,
    sut.valueLens.pickedMonths, [null, null],
    sut.valueLens.pickedAccounts, [null, null],
  );
  const defaultProps = RU.objFromPairs(
    sut.propsLens.onChange, onChange,
    sut.propsLens.value, defaultValue,
    sut.propsLens.accounts, accounts,
    sut.propsLens.getCurrency, getCurrency,
    sut.propsLens.getAccountBalanceEvolutionData, getAccountBalanceEvolutionData,
  );
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

  describe('handlePickedMonth', () => {

    it('handlers reducer', () => {
      const value = RU.objFromPairs(sut.valueLens.pickedMonths, [null, null]);
      const reducer = sut.handlePickedMonth(R.identity, 1, "FOO");
      const newValue = reducer(value);
      const newPickedMonths = R.view(sut.valueLens.pickedMonths, newValue);
      expect(newPickedMonths).toEqual([null, "FOO"]);
    });

    it('integration', () => {
      const value = RU.objFromPairs(sut.valueLens.pickedMonths, [null, null]);
      const onChange = x => x;
      const props = RU.objFromPairs(
        sut.propsLens.onChange, onChange,
        sut.propsLens.value, value,
      );
      const comp = mountAccountBalanceEvolutionComponent(props);
      
      const reducer = comp.find('MonthPicker').at(1).props().onPicked("FOO");
      const newValue = reducer(value);
      const newPickedMonths = R.view(sut.valueLens.pickedMonths, newValue);
      expect(newPickedMonths).toEqual([null, "FOO"]);
    });

  });

  describe('handlePickedAccountsChange', () => {

    it('base', () => {
      const reducer = sut.handlePickedAccountsChange(R.identity, ["FOO"]);
      const newValue = reducer({});
      const newPickedAccount = R.view(sut.valueLens.pickedAccounts, newValue);
      expect(newPickedAccount).toEqual(["FOO"]);
    });

    it('integration', () => {
      const onChange = x => x;
      const props = RU.objFromPairs(sut.propsLens.onChange, onChange);
      const comp = mountAccountBalanceEvolutionComponent(props);
      const selectedAccounts = AccountFactory.buildList(1);
      const reducer = comp
            .find('MultipleAccountsSelector')
            .props()
            .onSelectedAccountsChange(selectedAccounts);
      const newValue = reducer({});
      expect(R.view(sut.valueLens.pickedAccounts, newValue)).toEqual(selectedAccounts);
    });
    
  });

  describe('setAccountBalanceEvolutionData', () => {
    const reducer = sut.setAccountBalanceEvolutionData(x => x, "FOO");
    const newValue = reducer({});
    const newData = R.view(sut.valueLens.data, newValue);
    expect(newData).toEqual("FOO");
  });

  describe('handleSubmit', () => {
    let component, validateMonths, validateAccounts, inject, getAccountBalanceEvolutionData, dataPromise, account, dataPromiseValue, months;
    beforeEach(() => {
      months = [{month: "February", year: 2018}, {month: "April", year: 2018}];
      account = AccountFactory.build();
      dataPromiseValue = {data: [getExampleData(account)], months};
      dataPromise = Promise.resolve(dataPromiseValue);
      getAccountBalanceEvolutionData = sinon.fake.returns(dataPromise);
      const value = RU.objFromPairs(
        sut.valueLens.data, null,
        sut.valueLens.pickedMonths, dataPromiseValue.months,
        sut.valueLens.pickedAccounts, [1, 2]
      );
      const props = RU.objFromPairs(
        sut.propsLens.getAccountBalanceEvolutionData, getAccountBalanceEvolutionData,
        sut.propsLens.accounts, [account],
        sut.propsLens.value, value,
      );
      component = mountAccountBalanceEvolutionComponent(props);
      validateMonths = sinon.fake();
      validateAccounts = sinon.fake();
      inject = { validateMonths, validateAccounts };

      sinon.stub(window, 'alert').callsFake(()=>{});
    });

    afterEach(() => { sinon.restore(); });

    it('Dont run query if invalid pickedMonths', async () => {
      const pickedMonths = [null, null];
      const pickedAccounts = [account];
      const value = RU.objFromPairs(
        sut.valueLens.pickedMonths, pickedMonths,
        sut.valueLens.pickedAccounts, pickedAccounts,
      );
      const props = RU.objFromPairs(
        sut.propsLens.onChange, x => x,
        sut.propsLens.value, value
      );
      return expect(sut.handleSubmit(props))
        .resolves
        .toEqual(MONTH_VALIDATION_ERRORS.IS_NULL);
    });

    it('Dont run query if invalid pickedAccounts', async () => {
      const pickedMonths = months;
      const pickedAccounts = [null, null];
      const value = RU.objFromPairs(
        sut.valueLens.pickedMonths, pickedMonths,
        sut.valueLens.pickedAccounts, pickedAccounts,
      );
      const props = RU.objFromPairs(
        sut.propsLens.onChange, x => x,
        sut.propsLens.value, value
      );
      return expect(sut.handleSubmit(props))
        .resolves
        .toEqual(ACCOUNT_VALIDATION_ERRORS.IS_NULL);
    });
    
    it('calls getAccountBalanceEvolutionData', async () => {
      const responseData = {data: [getExampleData(account)], months};
      const getAccountBalanceEvolutionData = sinon.fake.resolves(responseData);
      const pickedMonths = months;
      const pickedAccounts = [account];
      const value = RU.objFromPairs(
        sut.valueLens.pickedMonths, pickedMonths,
        sut.valueLens.pickedAccounts, pickedAccounts,
      );
      const onChange = f => f(value);
      const props = RU.objFromPairs(
        sut.propsLens.value, value,
        sut.propsLens.getAccountBalanceEvolutionData, getAccountBalanceEvolutionData,
        sut.propsLens.onChange, onChange,
      );

      const result = await sut.handleSubmit(props);
      const expResult = sut.setAccountBalanceEvolutionData(onChange, responseData);

      // And ensures getAccountBalanceEvolutionData was called with the args
      expect(getAccountBalanceEvolutionData.args).toEqual([[[account], months]]);
      expect(result).toEqual(expResult);
    });

    it('Calls setAccountBalanceEvolutionData with response', async () => {
      const value = RU.objFromPairs(
        sut.valueLens.pickedMonths, months,
        sut.valueLens.pickedAccounts, [account],
      );
      const getAccountBalanceEvolutionData = sinon.fake.resolves("DATA");
      const props = RU.objFromPairs(
        sut.propsLens.value, value,
        sut.propsLens.getAccountBalanceEvolutionData, getAccountBalanceEvolutionData,
        sut.propsLens.onChange, x => x,
      );
      const reducer = await sut.handleSubmit(props);
      const expReducer = sut.setAccountBalanceEvolutionData(x => x, "DATA");

      expect(reducer({})).toEqual(expReducer({}));
    });

  });
  describe('MultipleAccountSelector', () => {
    it('Passes accounts prop', () => {
      const accounts = AccountFactory.buildList(2);
      const data = null;
      const props = RU.objFromPairs(
        sut.propsLens.accounts, accounts,
        R.compose(sut.propsLens.value, sut.valueLens.data), data
      );
      const comp = mountAccountBalanceEvolutionComponent(props);
      expect(findMultipleAccSelect(comp)).toHaveProp('accounts', accounts);
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
