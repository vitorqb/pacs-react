import React from 'react';
import ReactDOM from 'react-dom';
import { Factory } from 'rosie';
import faker from 'faker';
import * as R from 'ramda';
import moment from 'moment';
import { ACC_TYPES } from './constants';
import { MonthUtil } from './utils';

faker.seed(123);

function randomDate() {
  const out = faker.date.between('2015-01-01', '2025-12-31');
  return out.toISOString().format;
}

/**
 * A wrapper arround Factory.
 */
class AccountFactoryWrapper {

  constructor() {
    this.build = this.build.bind(this);
    this.buildList = this.buildList.bind(this);
    this.buildRoot = this.buildRoot.bind(this);
    this.buildRootAndChildren = this.buildRootAndChildren.bind(this);
  }

  _accountFactory = new Factory()
    .attr("pk", faker.random.number)
    .attr("name", faker.lorem.words)
    .attr("accType", ACC_TYPES.LEAF)
    .attr("parent", faker.random.number)

  build(opts={}) {
    return this._accountFactory.build(opts);
  }

  buildList(n, opts={}) {
    return this._accountFactory.buildList(n, opts);
  }

  /**
   * Builds a simple root account.
   */
  buildRoot() {
    return this.build({accType: ACC_TYPES.ROOT});
  }

  /**
   * Builds a simple branch account.
   */
  buildBranch() {
    return this.build({accType: ACC_TYPES.BRANCH});
  }

  /**
   * Builds a root plus n children, and returns in an array.
   * @param {number} n - The number of children.
   * @param {Object} childOpts - Parsed to this.build for children opts.
   * @return {Account[]} An array of account, where root is ensured to be in
   *   the head.
   */
  buildRootAndChildren(n=1, childOpts={}) {
    const root = this.buildRoot();
    const finalChildOpts = R.mergeAll([childOpts, {parent: root.pk}]);
    return [root].concat(this.buildList(n, finalChildOpts));
  }
}

export const AccountFactory = new AccountFactoryWrapper();

/**
 * A wrapper around Factory providing fake currencies for test.
 */
class CurrencyFactoryWrapper {

  constructor() {
    this.build = this.build.bind(this);
    this.buildList = this.buildList.bind(this);
  }

  _factory = new Factory()
    .attr("pk", faker.random.number)
    .attr("name", faker.lorem.words)
    .attr("imutable", faker.random.boolean)

  build(opts={}) {
    return this._factory.build(opts);
  }

  buildList(n, opts={}) {
    return this._factory.buildList(n, opts);
  }
}

export const CurrencyFactory = new CurrencyFactoryWrapper();

/**
 * A wrapper around Factory providing fake movements for test.
 */
class MovementFactoryWrapper {

  constructor() {
    this.build = this.build.bind(this);
    this.buildList = this.buildList.bind(this);
    this.buildBalancedPair = this.buildBalancedPair.bind(this);
  }

  _factory = new Factory()
    .attr("account", faker.random.number)
    .attr("money", () => ({
      quantity: faker.random.number({min: -10000, max: 10000}),
      currency: faker.random.number({min: 1, max: 100})
    }))

  build(opts={}) {
    return this._factory.build(opts);
  }

  buildList(n, opts={}) {
    return this._factory.buildList(n, opts);
  }

  /**
   * Builds a balanced pair, where currencies are the same, accounts are
   * different and quantities balance each other.
   */
  buildBalancedPair() {
    const first = this.build();
    const secondAccount = first.account + faker.random.number({ min: 1, max:10 });
    const secondMoney = {
      quantity: -first.money.quantity,
      currency: first.money.currency
    };
    const second = this.build({account: secondAccount, money: secondMoney});
    return [first, second];
  }
}

export const MovementFactory = new MovementFactoryWrapper();

/**
 * A wrapper around Factory prividing fake tags for test.
 */
class TagsFactoryWrapper {

  constructor() {
    this.build = this.build.bind(this);
    this.buildList = this.buildList.bind(this);
  }

  _factory = new Factory()
    .attr("name", faker.random.word)
    .attr("value", faker.random.word)

  build(opts={}) {
    return this._factory.build(opts);
  }

  buildList(n, opts={}) {
    return this._factory.buildList(n, opts);
  }

}

export const TagsFactory = new TagsFactoryWrapper();

/**
 * A wrapper around Factory prividing fake transactions for test.
 */
class TransactionFactoryWrapper {

  constructor() {
    this.build = this.build.bind(this);
    this.buildList = this.buildList.bind(this);
  }

  _factory = new Factory()
    .attr("pk", faker.random.number)
    .attr("description", faker.lorem.text)
    .attr("reference", "Test reference")
    .attr("date", moment.utc("2018-12-23"))
    .attr("movements", () => MovementFactory.buildList(2))
    .attr("tags", () => TagsFactory.buildList(2))

  /**
   * @param {object} opts
   * @return {Transaction}
   */
  build(opts) {
    return this._factory.build(opts);
  }

  /**
   * @param {number} n
   * @param {object} opts
   * @return {Transaction[]}
   */
  buildList(n, opts) {
    return this._factory.buildList(n, opts);
  }
  
}

export const TransactionFactory = new TransactionFactoryWrapper();

/**
  * A wrapper around Factory providing fake months for test.
  */
class MonthFactoryWrapper {

  constructor() {
    this.build = this.build.bind(this);
    this.buildList = this.buildList.bind(this);
    this.currentMonthIndex = -1;
    this.monthsIndexes = [0, 11, 1, 1, 7, 4, 5, 3, 11, 11, 10, 9, 6, 5, 1];
    this.currentYearIndex = -1;
    this.years = [2019, 1993, 2018, 1964, 1900, 2017, 2011, 2000, 1999, 1999];
  }

  getMonth() {
    if (this.currentMonthIndex >= this.monthsIndexes.length - 1) {
      this.currentMonthIndex = -1;
    }
    this.currentMonthIndex++;
    return MonthUtil.MONTHS[this.monthsIndexes[this.currentMonthIndex]];
  }

  getYear() {
    if (this.currentYearIndex >= this.years.length - 1) {
      this.currentYearIndex = -1;
    }
    this.currentYearIndex++;
    return this.years[this.currentYearIndex];
  }

  getFactory() {
    let year = this.getYear();
    let month = this.getMonth();
    return new Factory().attr('year', year).attr('month', month);
  }

  build(opts={}) { return this.getFactory().build(opts); }
  buildList(n, opts={}) { return this.getFactory().buildList(n, opts); }
}

export const MonthFactory = new MonthFactoryWrapper();

class MoneyFactoryWrapper {

  constructor() {
    this.build = this.build.bind(this);
    this.buildList = this.buildList.bind(this);
  }

  _factory = new Factory().attrs({
      quantity: faker.random.number({min: -10000, max: 10000}),
      currency: faker.random.number({min: 1, max: 100}),
    });

  build(opts={}) { return this._factory.build(opts); }
  buildList(n, opts={}) { return this._factory.buildList(n, opts); }
  
}

export const MoneyFactory = new MoneyFactoryWrapper();

/**
 * A wrapper around Factory providing fake accountFlows for test.
 */
class AccountFlowFactoryWrapper {

  constructor() {
    this.build = this.build.bind(this);
    this.buildList = this.buildList.bind(this);
  }

  _factory = new Factory()
    .attr('account', faker.random.number)
    .attr('flows', () => {
      const moneysOne = MoneyFactory.buildList(2);
      const periodOne = MonthUtil.monthToPeriod(MonthFactory.build());
      const moneysTwo = MoneyFactory.buildList(0);
      const periodTwo = MonthUtil.monthToPeriod(MonthFactory.build());
      return [{ moneys: moneysOne, period: periodOne },
              { moneys: moneysTwo, period: periodTwo }];
    })

  build(opts={}) { return this._factory.build(opts); }
  buildList(n, opts={}) { return this._factory.buildList(n, opts); }
  
}

export const AccountFlowFactory = new AccountFlowFactoryWrapper();

/**
 * A wrapper around Factory providing fake prices for test.
 */
class PriceFactoryWrapper {

  constructor() {
    this.build = this.build.bind(this);
    this.buildList = this.buildList.bind(this);
  }

  _factory = new Factory()
    .attr('price', faker.random.number({min: 0, max: 100}))
    .attr('date', randomDate())

  build(opts={}) { return this._factory.build(opts); }
  buildList(n, opts={}) { return this._factory.buildList(n, opts); }

}

export const PriceFactory = new PriceFactoryWrapper();

/**
 * Makes a mock for an axios error.
 */
export const makeAxiosErrorPromise = errObj =>
  Promise.reject({response: {data: errObj}});

/**
 * Asserts that mouting element causes an error to be thrown, and that message
 * contains expectedError.
 * source: https://gist.github.com/gaearon/adf9d5500e11a4e7b2c6f7ebf994fe56
 */
export function expectRenderError(element, expectedError) {
  // Noop error boundary for testing.
  class TestBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { didError: false };
    }
    componentDidCatch(err) {
      this.setState({ didError: true });
    }
    render() {
      return this.state.didError ? null : this.props.children;
    }
  }

  // Record all errors.
  let topLevelErrors = [];
  function handleTopLevelError(event) {
    topLevelErrors.push(event.error);
    // Prevent logging
    event.preventDefault();
  }

  const div = document.createElement('div');
  window.addEventListener('error', handleTopLevelError);
  try {
    ReactDOM.render(
      <TestBoundary>
        {element}
      </TestBoundary>,
      div
    );
  } finally {
    window.removeEventListener('error', handleTopLevelError);
  }

  expect(topLevelErrors.length).toBe(1);
  expect(topLevelErrors[0].message).toContain(expectedError);
}

export const waitFor = async (f) => {
  const waitPromise = () => new Promise((resolve, _) => setTimeout(resolve, 100));
  var i = 0;
  while (i < 20) {
    const result = f();
    if (result) {
      return
    }
    i++;
    await waitPromise();
  }
  throw new Error("Timeout inside waitFor!");
};


export class MockLocalStorage {

  constructor() {
    this._data = {};
  }

  setItem(key, value) {
    this._data[key] = value;
  }

  getItem(key) {
    return this._data[key];
  }

  removeItem(key) {
    delete this._data[key];
  }

}


export const useStateMock = (defaultValue=null) => {
  let value = defaultValue;
  let setValue = (x) => {
    if (typeof x === 'function') {
      value = x(value);
    } else {
      value = x;
    }
    return value;
  };
  let getValue = () => value;
  return [getValue, setValue];
};


export const updateComponent = async (component) => {
  component.update();
  await new Promise(setTimeout);
  component.update();
};
