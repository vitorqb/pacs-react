import React from 'react';
import * as R from 'ramda';
import * as RU from '../../../ramda-utils';
import { lens as AppLens } from '../../Lens.js';
import { AccountFactory, CurrencyFactory } from '../../../testUtils';
import { mount } from 'enzyme';
import renderEditTransactionComponent from '../EditTransactionComponent.jsx';

describe('', () => {

  it('Loading while currencies is null...', () => {
    const appContext = R.set(AppLens.accounts, [AccountFactory.build()], {});
    const ajaxInjections = {};
    const component = mount(renderEditTransactionComponent({ appContext, ajaxInjections }));
    expect(component).toMatchElement(<p>Loading...</p>);
  });

  it('Loading while accounts is null...', () => {
    const appContext = R.set(AppLens.currencies, [CurrencyFactory.build()], {});
    const ajaxInjections = {};
    const component = mount(renderEditTransactionComponent({ appContext, ajaxInjections }));
    expect(component).toMatchElement(<p>Loading...</p>);
  });

  it('Renders when both not null', () => {
    const appContext = RU.objFromPairs(
      AppLens.currencies, [],
      AppLens.accounts, [],
    );
    const ajaxInjections = {};
    const component = mount(renderEditTransactionComponent({ appContext, ajaxInjections }));
    expect(component).toContainMatchingElement('EditTransactionComponent');
  });  

});
