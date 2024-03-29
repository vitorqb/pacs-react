import React from 'react';
import { mount } from 'enzyme';
import * as RU from '../../../ramda-utils.js';
import * as sut from '../AccountBalanceEvolutionComponent';
import AccountBalanceEvolutionComponent from '../../../components/AccountBalanceEvolutionComponent';
import { lens as AppContextLens } from '../../AppContext';
import { lens as EventsLens } from '../../Events';
import * as testUtils from '../../../testUtils.jsx';

const account = testUtils.AccountFactory.build();
const currency = testUtils.CurrencyFactory.build();

const defaultProps = {
  appContext: RU.objFromPairs(
    AppContextLens.accounts, [account],
    AppContextLens.currencies, [currency],
  ),
  events: RU.objFromPairs(
    EventsLens.overState, () => () => {},
  ),
  appContextGetters: RU.objFromPairs(
    AppContextLens.accounts, () => account,
    AppContextLens.currencies, () => currency,
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
