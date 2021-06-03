import React from 'react';
import { mount } from 'enzyme';
import * as RU from '../../../ramda-utils.js';
import * as R from 'ramda';
import * as sut from '../AccountBalanceEvolutionComponent';
import AccountBalanceEvolutionComponent, { propsLens, valueLens } from '../../../components/AccountBalanceEvolutionComponent';
import { lens as AppLens } from '../../Lens';
import { lens as EventsLens } from '../../Events';
import * as testUtils from '../../../testUtils.jsx';

const account = testUtils.AccountFactory.build();
const currency = testUtils.CurrencyFactory.build();

const defaultProps = {
  appContext: RU.objFromPairs(
    AppLens.accounts, [account],
    AppLens.currencies, [currency],
  ),
  events: RU.objFromPairs(
    EventsLens.overState, () => () => {},
  ),
  appContextGetters: RU.objFromPairs(
    AppLens.accounts, () => account,
    AppLens.currencies, () => currency,
  )
};

const renderComponent = (props) => {
  return mount(
    <sut.AccountBalanceEvolutionComponentInstance {...defaultProps} {...props}/>
  );
};

describe('AccountBalanceEvolutionComponentInstance', () => {

  it('Mounts with initial state', () => {
    const component = renderComponent();
    const initialState = component.find(AccountBalanceEvolutionComponent).props().value;
    expect(initialState).toEqual(sut.initialState);
  });

});
