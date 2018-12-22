import React from 'react';
import ReactDOM from 'react-dom';
import { Factory } from 'rosie';
import faker from 'faker';
import * as R from 'ramda';

faker.seed(123);

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
    .attr("accType", "Leaf")
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
    return this.build({accType: "Root"})
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
    .attr("imutable", faker.boolean)

  build(opts={}) {
    return this._factory.build(opts);
  }

  buildList(n, opts={}) {
    return this._factory.buildList(n, opts);
  }
}

export const CurrencyFactory = new CurrencyFactoryWrapper();

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
