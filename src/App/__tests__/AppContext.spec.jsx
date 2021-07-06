import React from 'react';
import { mount } from 'enzyme';
import * as R from 'ramda';
import * as RU from '../../ramda-utils.js';
import * as sut from '../AppContext.jsx';
import * as Ajax from '../Ajax.jsx';
import { AccountFactory, CurrencyFactory } from '../../testUtils.jsx';
import { FeatureFlagsSvc } from '../FeatureFlags.jsx';
import { waitFor } from '../../testUtils.jsx';
import { act } from 'react-dom/test-utils';

describe('_fetch', () => {

  it('Two long', async () => {
    expect.assertions(1);
    const state = {a: 1};
    const specs = [
      [x => Promise.resolve(x.two), R.lensProp('b')],
      [x => Promise.resolve(x.three), R.lensProp('c')],
    ];
    const ajaxInjections = {two: 2, three: 3};
    const reducer = await sut._fetch(specs, ajaxInjections);
    expect(reducer(state)).toEqual({a: 1, b: 2, c: 3});
  });

});

describe('fetch', () => {

  const accounts = [AccountFactory.build()];
  const currencies = [CurrencyFactory.build()];

  const ajaxInjections = RU.objFromPairs(
    Ajax.lens.getAccounts, () => Promise.resolve(accounts),
    Ajax.lens.getCurrencies, () => Promise.resolve(currencies),
  );

  const initialState = {};

  it('fetches currencies, accounts and set feature flags', async () => {
    const reducer = await sut.fetch(ajaxInjections);
    const result = reducer(initialState);
    expect(result).toEqual(RU.objFromPairs(
      sut.lens.accounts, accounts,
      sut.lens.currencies, currencies,
    ));
  });

});

describe('AppContextProvider', () => {

  const accounts = [AccountFactory.build()];
  const currencies = [CurrencyFactory.build()];
  const featureFlagsSvc = new FeatureFlagsSvc({}, ()=>{});

  const ajaxInjections = RU.objFromPairs(
    Ajax.lens.getAccounts, () => Promise.resolve(accounts),
    Ajax.lens.getCurrencies, () => Promise.resolve(currencies),
  );

  const Child = ({appContext, refreshRemoteData}) => <div>CHILD</div>;

  const renderComponent = () => mount(
    <sut.AppContextProvider ajaxInjections={ajaxInjections} featureFlagsSvc={featureFlagsSvc}>
      {p => <Child {...p}/>}
    </sut.AppContextProvider>
  );

  it('renders children with app context', async () => {
    await act(async () => {
      const component = renderComponent();
      await waitFor(() => {
        component.update();
        return component.find('LoadingWrapper').props().isLoading == false;
      });
      expect(component.find(Child).props().appContext).toEqual(RU.objFromPairs(
        sut.lens.accounts, accounts,
        sut.lens.currencies, currencies,
        sut.lens.featureFlagsSvc, featureFlagsSvc,
      ));
    });
  });

});
